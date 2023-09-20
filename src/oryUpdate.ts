import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { outputChannel, oryCommand } from './extension';
import { format, spwanCommonErrAndClose } from './helper';

export async function runOryUpdate() {
  const result = await vscode.window.showQuickPick(
    [
      {
        label: 'identity-config',
        description: 'Update the Ory Identities configuration of the specified Ory Network project.',
        type: 'string'
      },
      { label: 'oauth2-client', description: 'Update an OAuth 2.0 Client.', type: 'string' },
      {
        label: 'oauth2-config',
        description: 'Update the Ory OAuth2 & OpenID Connect configuration of the specified Ory Network project.',
        type: 'string'
      },
      { label: 'opl', description: 'Update the Ory Permission Language file in Ory Network.', type: 'string' },
      {
        label: 'permission-config',
        description: 'Update Ory Permissions configuration of the specified Ory Network project.',
        type: 'string'
      },
      { label: 'project', description: 'Update Ory Network project service configuration.', type: 'string' }
    ],
    { placeHolder: 'Pick to update resource...', title: 'Ory Get', ignoreFocusOut: true }
  );

  switch (result?.label) {
    case 'identity-config':
      const projectId = await commandInput(result);
      await oryUpdateIdentityConfig(projectId);
      break;
  }
}

// TODO: need to fix error message after updating config.
async function oryUpdateIdentityConfig(projectId: string[]) {
  // select file type json, yml, url or base64://json
  const fileTypeInput = await fileType('Identity Config');
  if (fileTypeInput === 'yaml/yml' || fileTypeInput === 'json') {
    const fileLocation = await vscode.window.showOpenDialog({
      title: 'Ory Update Identity Config',
      canSelectMany: false,
      filters: { yaml: ['yaml', 'yml'], json: ['json'] }
    });

    if (fileLocation === undefined) {
      return;
    }

    const updateIdentityConfig = spawn(oryCommand, [
      'update',
      'identity-config',
      projectId[0],
      '--file',
      `${fileLocation[0].fsPath}`
    ]);

    spwanCommonErrAndClose(updateIdentityConfig, 'update', '');

    return;
  }
  // take input for base64 and url
  const base64OrURLPrefix = fileTypeInput === 'url' ? 'https://example.org/config.yaml' : 'base64://<json>';
  const configURL = await vscode.window.showInputBox({
    title: 'Ory Update Identity Config',
    placeHolder: `Enter ${base64OrURLPrefix}`,
    ignoreFocusOut: true
  });

  if (configURL === undefined) {
    return;
  }
  const updateIdentityConfig = spawn(oryCommand, ['update', 'identity-config', projectId[0], '--file', configURL]);

  spwanCommonErrAndClose(updateIdentityConfig, 'update', '');

  return;
}

export async function fileType(cmd: string): Promise<string> {
  const formatInput = await vscode.window.showQuickPick(
    [{ label: 'json', picked: true }, { label: 'yaml/yml' }, { label: 'url' }, { label: 'base64' }],
    { title: `${cmd} format`, placeHolder: 'Set the output format', ignoreFocusOut: true }
  );

  switch (formatInput?.label) {
    case 'yaml/yml':
      return 'yaml';
    case 'url':
      return 'url';
    case 'base64':
      return 'base64';
    default:
      return 'json';
  }
}

export async function commandInput(obj: {
  label: string;
  description: string;
  type: string;
  useLabelPlaceHolder?: boolean;
}): Promise<string[]> {
  let resultString: string[] = [];
  let input: string | undefined;
  if (obj.type === 'empty') {
    input = '';
  } else {
    let placeHolder = obj.useLabelPlaceHolder ? obj.label : 'Project ID';
    input = await vscode.window.showInputBox({
      title: obj.label,
      placeHolder:
        obj.type === 'string' ? `Enter ${placeHolder}` : 'Enter multiple inputs "," (comma-separated). ex- id-1, id-2',
      prompt: obj.description,
      ignoreFocusOut: true
    });
  }

  if (input === undefined) {
    throw new Error('Invalid input');
  }

  if (obj.type === 'strings') {
    // (?:,|s)s*
    input = input.replace(RegExp('(?:,\\s)s*'), ',');
    resultString = input.split(',');
  } else {
    resultString.push(input);
  }

  return resultString;
}
