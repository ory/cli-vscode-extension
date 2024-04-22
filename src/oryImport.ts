import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { oryCommand } from './extension';
import { spawnCommonErrAndClose, fileType } from './helper';
import { logger } from './helper/logger';

export async function runOryImport() {
  const result = await vscode.window.showQuickPick(
    [
      {
        label: 'identities',
        description: 'Import one or more identities from files',
        type: 'string'
      },
      {
        label: 'jwk',
        description: 'Imports JSON Web Keys from one or more JSON files.',
        type: 'string'
      },
      {
        label: 'oauth2-client',
        description: 'Import one or more OAuth 2.0 Clients from files.',
        type: 'string'
      }
    ],
    {
      placeHolder: 'Pick to import...',
      title: 'Ory Import',
      ignoreFocusOut: true
    }
  );

  switch (result?.label) {
    case 'identities':
      await oryImportIdentities(result);
      break;
    case 'jwk':
      await oryImportJWK(result);
      break;
    case 'oauth2-client':
      await oryImportOAuth2Client(result);
      break;
  }
}
export async function oryImportIdentities(result: vscode.QuickPickItem) {
  const identityInputs = await commandInput(result);
  if (identityInputs === undefined) {
    return;
  }
  console.log(identityInputs);
  //   const command = commandBuilder(identityInputs);
  let projectID = identityInputs[0];
  let files = identityInputs.slice(1);
  const importIdentityConfig = spawn(oryCommand, ['import', 'identities', ...files, '--project', projectID]);

  await spawnCommonErrAndClose(importIdentityConfig, 'identities', '');
  return;
}

export async function oryImportJWK(result: vscode.QuickPickItem) {
  const flags = await vscode.window.showQuickPick(
    [
      {
        label: 'alg',
        description:
          'Sets the "alg" value of the JSON Web Key if not "alg" value was defined by the key itself. Required when importing PEM/DER encoded data.'
      },
      {
        label: 'use',
        description:
          'Sets the "use" value of the JSON Web Key if no "use" value was defined by the key itself. Required when importing PEM/DER encoded data. (default "sig")'
      },
      {
        label: 'none',
        picked: true
      }
    ],
    {
      placeHolder: 'Select the flags to generate the key.',
      title: 'JWK Flags',
      ignoreFocusOut: true,
      canPickMany: true
    }
  );

  if (flags === undefined) {
    return;
  }

  const jwkSetInput = await vscode.window.showInputBox({
    title: 'JWK Set ID',
    placeHolder: '<my-jwk-set>',
    ignoreFocusOut: true
  });

  if (jwkSetInput === undefined) {
    vscode.window.showErrorMessage(`Invalid jwk set id ${jwkSetInput}`);
    logger.error(`Invalid jwk set id ${jwkSetInput}`);
    return;
  }

  const jwkInputs = await commandInput(result);
  if (jwkInputs === undefined) {
    return;
  }
  console.log(jwkInputs);

  const flagDataJson: { [key: string]: string } = {};

  for (const flag of flags) {
    if (flag.label === 'alg') {
      const algorithm = await vscode.window.showQuickPick(
        [
          { label: 'RS256', picked: true },
          { label: 'RS512' },
          { label: 'ES256' },
          { label: 'ES512' },
          { label: 'EdDSA' }
        ],
        { placeHolder: 'Select the algorithm to generate the key. (default "RS256")', title: 'JWK Algorithm' }
      );

      if (algorithm === undefined) {
        return;
      }

      flagDataJson[flag.label] = algorithm.label;
    }

    if (flag.label === 'use') {
      const intendedUse = await vscode.window.showQuickPick([{ label: 'sig', picked: true }, { label: 'enc' }], {
        placeHolder: 'Select intended use of this key. (default "sig")',
        title: 'Use'
      });

      if (intendedUse === undefined) {
        return;
      }

      flagDataJson[flag.label] = intendedUse.label;
    }
  }
  let projectID = jwkInputs[0];
  let files = jwkInputs.slice(1);

  if (flagDataJson !== null) {
    const command = commandBuilder(flagDataJson);
    const importJWK = spawn(oryCommand, ['import', 'jwk', jwkSetInput, ...files, 'project', projectID, ...command]);
    await spawnCommonErrAndClose(importJWK, 'jwk', '');
    return;
  }
  const importJWK = spawn(oryCommand, ['import', 'jwk', jwkSetInput, ...files, 'project', projectID]);

  await spawnCommonErrAndClose(importJWK, 'jwk', '');
  return;
}

export async function oryImportOAuth2Client(result: vscode.QuickPickItem) {
  const flags = await vscode.window.showQuickPick(
    [
      {
        label: 'keybase',
        description: 'Keybase username for encrypting client secret.'
      },
      {
        label: 'pgp-key',
        description: 'Base64 encoded PGP encryption key for encrypting client secret.'
      },
      {
        label: 'pgp-key-url',
        description: 'PGP encryption key URL for encrypting client secret.'
      },
      {
        label: 'none',
        picked: true
      }
    ],
    {
      placeHolder: 'Select the flags to encrypt an autogenerated client secret.',
      title: 'Oauth2-client Flags',
      ignoreFocusOut: true,
      canPickMany: true
    }
  );

  if (flags === undefined) {
    return;
  }

  const oauth2ClientInputs = await commandInput(result);
  if (oauth2ClientInputs === undefined) {
    return;
  }
  console.log(oauth2ClientInputs);

  const flagDataJson: { [key: string]: string } = {};

  for (const flag of flags) {
    if (flag.label === 'keybase') {
      const keybaseUsername = await vscode.window.showInputBox({
        title: 'Keybase Username',
        placeHolder: 'keybase username',
        ignoreFocusOut: true
      });

      if (keybaseUsername === undefined) {
        return;
      }
      flagDataJson[flag.label] = keybaseUsername;
    }

    if (flag.label === 'pgp-key') {
      const pgpKey = await vscode.window.showInputBox({
        title: 'PGP Key',
        placeHolder: 'base64 encoded PGP encryption key',
        ignoreFocusOut: true
      });

      if (pgpKey === undefined) {
        return;
      }

      flagDataJson[flag.label] = pgpKey;
    }

    if (flag.label === 'pgp-key-url') {
      const pgpKeyURL = await vscode.window.showInputBox({
        title: 'PGP Key URL',
        placeHolder: 'PGP encryption key URL',
        ignoreFocusOut: true
      });

      if (pgpKeyURL === undefined) {
        return;
      }

      flagDataJson[flag.label] = pgpKeyURL;
    }
  }
  let projectID = oauth2ClientInputs[0];
  let file = oauth2ClientInputs.slice(1);

  const command = commandBuilder(flagDataJson);

  logger.info('command: ' + JSON.stringify(command));

  const importOauth2Client = spawn(oryCommand, ['import', 'oauth2-client', ...file, 'project', projectID, ...command]);

  await spawnCommonErrAndClose(importOauth2Client, 'project', '');
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
  const flagDataJson: string[] = [];

  let projectID = await vscode.window.showInputBox({
    title: `Ory Import ${result.label} for which project?`,
    placeHolder: 'project ID',
    ignoreFocusOut: true
  });

  if (projectID === undefined) {
    return;
  }
  flagDataJson.push(projectID);

  const fileLocation = await vscode.window.showOpenDialog({
    title: `Ory Patch ${result.label}`,
    filters: {
      json: ['json'],
      rsa: ['key', 'pub'],
      yaml: ['yaml', 'yml']
    },
    canSelectMany: true
  });

  if (fileLocation === undefined) {
    return;
  }

  for (const file of fileLocation) {
    flagDataJson.push(file.fsPath);
  }
  logger.info(`${flagDataJson}`, 'import');
  return flagDataJson;
}
