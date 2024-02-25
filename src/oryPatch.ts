import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { oryCommand } from './extension';
import { spawnCommonErrAndClose, fileType } from './helper';

export async function runOryPatch() {
  const result = await vscode.window.showQuickPick([
    {
      label: 'identity-config',
      description: 'Patch the Ory Identities configuration of the defined Ory Network project.',
      type: 'string'
    },
    {
      label: 'oauth2-config',
      description: 'Patch the Ory OAuth2 & OpenID Connect configuration of the specified Ory Network project.',
      type: 'string'
    },
    {
      label: 'permission-config',
      description: 'Patch the Ory Permissions configuration of the specified Ory Network project.',
      type: 'string'
    },
    {
      label: 'project',
      description: 'Patch the Ory Network project configuration.',
      type: 'string'
    },
    {
      label: 'opl',
      description: 'Update the Ory Permission Language file in Ory Network.',
      type: 'string'
    }
  ]);

  switch (result?.label) {
    case 'identity-config':
      await oryPatchIdentityConfig(result);
      break;
    case 'oauth2-config':
      await oryPatchOAuth2Config(result);
      break;
    case 'permission-config':
      await oryPatchPermissionConfig(result);
      break;
    case 'project':
      await oryPatchProject(result);
      break;
    case 'opl':
      await oryPatchOPL(result);
      break;
  }
}
export async function oryPatchIdentityConfig(result: vscode.QuickPickItem) {
  const identityInputs = await commandInput(result);
  if (identityInputs === undefined) {
    return;
  }
  console.log(identityInputs);
  const command = commandBuilder(identityInputs);

  const patchIdentityConfig = spawn(oryCommand, ['patch', 'identity-config', identityInputs.projectID, ...command]);

  await spawnCommonErrAndClose(patchIdentityConfig, 'identity-config', '');
  return;
}

export async function oryPatchOAuth2Config(result: vscode.QuickPickItem) {
  const oauth2ConfigInputs = await commandInput(result);
  if (oauth2ConfigInputs === undefined) {
    return;
  }
  console.log(oauth2ConfigInputs);
  const command = commandBuilder(oauth2ConfigInputs);

  const patchOAuth2Config = spawn(oryCommand, ['patch', 'oauth2-config', oauth2ConfigInputs.projectID, ...command]);

  await spawnCommonErrAndClose(patchOAuth2Config, 'oauth2-config', '');
  return;
}

export async function oryPatchProject(result: vscode.QuickPickItem) {
  const projectInputs = await commandInput(result);
  if (projectInputs === undefined) {
    return;
  }
  console.log(projectInputs);
  const command = commandBuilder(projectInputs);

  const patchProject = spawn(oryCommand, ['patch', 'project', projectInputs.projectID, ...command]);

  await spawnCommonErrAndClose(patchProject, 'project', '');
  return;
}

export async function oryPatchPermissionConfig(result: vscode.QuickPickItem) {
  const permissionConfigInputs = await commandInput(result);
  if (permissionConfigInputs === undefined) {
    return;
  }
  console.log(permissionConfigInputs);
  const command = commandBuilder(permissionConfigInputs);

  const patchPermissionConfig = spawn(oryCommand, [
    'patch',
    'permission-config',
    permissionConfigInputs.projectID,
    ...command
  ]);

  await spawnCommonErrAndClose(patchPermissionConfig, 'permission-config', '');
  return;
}

export async function oryPatchOPL(result: vscode.QuickPickItem) {
  const oplInputs = await commandInput(result);
  if (oplInputs === undefined) {
    return;
  }
  console.log(oplInputs);
  const command = commandBuilder(oplInputs);

  const patchOPL = spawn(oryCommand, ['patch', 'opl', oplInputs.projectID, ...command]);

  await spawnCommonErrAndClose(patchOPL, 'opl', '');
  return;
}

function commandBuilder(input: { [key: string]: string }) {
  let stringBuilder: string[] = [];
  for (const key in input) {
    if (key === 'projectID') {
      continue;
    }
    stringBuilder.push('--' + key + '=' + input[key]);
  }
  return stringBuilder;
}

async function commandInput(result: vscode.QuickPickItem) {
  const options = await vscode.window.showQuickPick(
    [
      { label: 'add', description: 'Add a specific key to the configuration' },
      { label: 'remove', description: 'Remove a specific key from the configuration' },
      { label: 'replace', description: 'Replace a specific key in the configuration' },
      { label: 'file', description: 'Configuration file(s) to update the project' }
    ],
    {
      title: `Patch ${result.label} Options`,
      placeHolder: 'options...',
      canPickMany: true,
      ignoreFocusOut: true
    }
  );

  if (options === undefined) {
    return;
  }

  const flagDataJson: { [key: string]: string } = {};

  let projectID = await vscode.window.showInputBox({
    title: `Patch ${result.label} of which project?`,
    placeHolder: 'project ID',
    ignoreFocusOut: true
  });

  if (projectID === undefined) {
    return;
  }
  flagDataJson['projectID'] = `${projectID}`;

  for (const option of options) {
    if (option.label === 'file') {
      const fileTypeInput = await fileType(`Ory Patch ${result.label}`);
      if (fileTypeInput === 'noUploadTypeSelected') {
        return;
      }

      if (fileTypeInput === 'yaml/yml' || fileTypeInput === 'json') {
        const fileLocation = await vscode.window.showOpenDialog({
          title: `Ory Patch ${result.label}`,
          filters: {
            yaml: ['yaml', 'yml'],
            json: ['json']
          },
          canSelectMany: false
        });

        if (fileLocation === undefined) {
          return;
        }
        flagDataJson[option.label] = `${fileLocation[0].fsPath}`;
      } else {
        // take input for base64 and url
        const base64OrURLPrefix = fileTypeInput === 'url' ? 'https://example.org/config.yaml' : 'base64://<json>';
        const configURL = await vscode.window.showInputBox({
          title: `Ory Patch ${result.label}`,
          placeHolder: `Enter ${base64OrURLPrefix}`,
          ignoreFocusOut: true
        });

        if (configURL === undefined) {
          return;
        }

        flagDataJson[option.label] = configURL;
      }
    } else {
      const val = (await vscode.window.showInputBox({
        title: `Ory Patch ${result.label}`,
        prompt: `${option.description}`,
        placeHolder: '/selfservice/methods/password/enabled=false',
        ignoreFocusOut: true
      }))!;
      if (val) {
        flagDataJson[option.label] = val;
      }
    }
  }
  return flagDataJson;
}
