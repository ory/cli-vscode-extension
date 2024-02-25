import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { outputChannel, oryCommand } from './extension';
import { spawnCommonErrAndClose, fileType } from './helper';
import { oauth2Client } from './oryCreate';

export async function runOryUpdate() {
  const result = await vscode.window.showQuickPick(
    [
      {
        label: 'identity-config',
        description: 'Update the Ory Identities configuration of the specified Ory Network project.',
        type: 'string'
      },
      { label: 'oauth2-client', description: 'Update an OAuth 2.0 Client.', type: 'string', useLabelPlaceHolder: true },
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
    { placeHolder: 'Pick to update resource...', title: 'Ory Update', ignoreFocusOut: true }
  );

  switch (result?.label) {
    case 'identity-config':
      const identityProjectId = await commandInput(result);
      if (identityProjectId.length === 0) {
        return;
      }
      await oryUpdateIdentityConfig(identityProjectId);
      break;
    case 'oauth2-client':
      const oauth2ClientId = await commandInput(result);
      if (oauth2ClientId.length === 0) {
        return;
      }
      await oryUpdateOAuth2Client(oauth2ClientId[0]);
      break;
    case 'oauth2-config':
      const oauth2ConfigPID = await commandInput(result);
      if (oauth2ConfigPID.length === 0) {
        return;
      }
      await oryUpdateOAuth2Config(oauth2ConfigPID);
      break;
    case 'permission-config':
      const permissionConfigPID = await commandInput(result);
      if (permissionConfigPID.length === 0) {
        return;
      }
      await oryUpdatePermissionConfig(permissionConfigPID);
      break;
    case 'opl':
      const oplPID = await commandInput(result);
      if (oplPID.length === 0) {
        return;
      }
      await oryUpdateOPL(oplPID);
      break;
    case 'project':
      const projectId = await commandInput(result);
      if (projectId.length === 0) {
        return;
      }
      await oryUpdateProjectConfig(projectId);
      break;
  }
  return;
}

// TODO: need to fix error message after updating config.
export async function oryUpdateIdentityConfig(projectId: string[]) {
  await configUpdater('Identity', 'identity-config', projectId);
  return;
}

export async function oryUpdateOAuth2Client(oauthClientID: string) {
  let oauth2ClientOptions: string[] = [];
  await oauth2Client().then((value) => {
    if (value.length === 0) {
      return;
    }
    oauth2ClientOptions = value;
  });
  const updateOauth2Client = spawn(oryCommand, ['update', 'oauth2-client', oauthClientID, ...oauth2ClientOptions]);

  var successUpdateOrNot = await spawnCommonErrAndClose(updateOauth2Client, '', '');
  console.log('success: ' + successUpdateOrNot);
  return;
}

export async function oryUpdateOAuth2Config(projectId: string[]) {
  await configUpdater('OAuth2', `oauth2-config`, projectId);
  return;
}

export async function oryUpdatePermissionConfig(projectId: string[]) {
  await configUpdater('Permission', `permission-config`, projectId);
  return;
}

export async function oryUpdateOPL(projectID: string[]) {
  const formatInput = await vscode.window.showQuickPick([{ label: 'url' }, { label: 'file' }], {
    title: `update opl format`,
    placeHolder: 'Set the output format',
    ignoreFocusOut: true
  });

  if (formatInput === undefined) {
    return;
  }

  if (formatInput?.label === 'file') {
    const fileLocation = await openFileSelection(`Ory Update OLP Config`, {
      typescript: ['ts']
    });

    if (fileLocation === undefined) {
      return;
    }
    console.log(projectID);
    const updateOPLConfig = spawn(oryCommand, [
      'update',
      'opl',
      '--project',
      projectID[0],
      '--file',
      `${fileLocation[0].fsPath}`
    ]);

    await spawnCommonErrAndClose(updateOPLConfig, 'update opl', '');

    return;
  }

  const configURL = await getInputBox(`Ory Update OPL Config`, `Enter https://example.org/config.ts`);

  if (configURL === undefined) {
    return;
  }
  const updateConfig = spawn(oryCommand, ['update', 'opl', '--project', projectID[0], '--file', configURL]);

  await spawnCommonErrAndClose(updateConfig, 'update opl', '');

  return;
}

export async function oryUpdateProjectConfig(projectId: string[]) {
  const yNInput = await vscode.window.showQuickPick([{ label: 'yes' }, { label: 'no' }], {
    title: `Do you want to update project name?`,
    placeHolder: '[yes/no]',
    ignoreFocusOut: true
  });

  if (yNInput === undefined) {
    return;
  }

  let nameFlag: string[] = [];

  switch (yNInput.label.toLowerCase()) {
    case 'yes':
      const name = await vscode.window.showInputBox({
        title: 'update name',
        placeHolder: 'name'
      });
      nameFlag.push('--name');
      nameFlag.push(`"${name}"`);
      break;
    default:
      break;
  }
  await configUpdater('Project', 'project', projectId, nameFlag);
  return;
}

async function configUpdater(name: string, subCmdName: string, projectId: string[], optFlags?: string[]) {
  if (optFlags === undefined) {
    optFlags = [];
  }
  // select file type json, yml, url or base64://json
  const fileTypeInput = await fileType(`${name} Config`);
  if (fileTypeInput === 'noUploadTypeSelected') {
    return;
  }

  if (fileTypeInput === 'yaml/yml' || fileTypeInput === 'json') {
    const fileLocation = await openFileSelection(`Ory Update ${name} Config`, {
      yaml: ['yaml', 'yml'],
      json: ['json']
    });

    if (fileLocation === undefined) {
      return;
    }

    const updateConfig = spawn(oryCommand, [
      'update',
      `${subCmdName}`,
      projectId[0],
      '--file',
      `${fileLocation[0].fsPath}`,
      ...optFlags
    ]);

    await spawnCommonErrAndClose(updateConfig, 'update', '');

    return;
  }
  // take input for base64 and url
  const base64OrURLPrefix = fileTypeInput === 'url' ? 'https://example.org/config.yaml' : 'base64://<json>';
  const configURL = await getInputBox(`Ory Update ${name} Config`, `Enter ${base64OrURLPrefix}`);

  if (configURL === undefined) {
    return;
  }
  const updateConfig = spawn(oryCommand, ['update', `${subCmdName}`, projectId[0], '--file', configURL, ...optFlags]);

  await spawnCommonErrAndClose(updateConfig, '', '');

  return;
}

async function openFileSelection(title: string, filters: any) {
  const fileLocation = await vscode.window.showOpenDialog({
    title: title,
    canSelectMany: false,
    filters: filters
  });

  return fileLocation;
}

async function getInputBox(title: string, placeHolder: string) {
  const userInput = await vscode.window.showInputBox({
    title: title,
    placeHolder: placeHolder,
    ignoreFocusOut: true
  });

  return userInput;
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
    let placeHolder = obj.useLabelPlaceHolder ? obj.label + ' ID' : 'Project ID';
    input = await vscode.window.showInputBox({
      title: obj.label,
      placeHolder:
        obj.type === 'string' ? `Enter ${placeHolder}` : 'Enter multiple inputs "," (comma-separated). ex- id-1, id-2',
      prompt: obj.description,
      ignoreFocusOut: true
    });
  }

  if (input === undefined) {
    // throw new Error('Invalid input');
    outputChannel.append('Invalid Input');
    return [];
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
