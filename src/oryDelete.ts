import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { outputChannel, oryCommand } from './extension';
import { spawnCommonErrAndClose, commandInput } from './helper';

export async function runOryDelete() {
  const result = await vscode.window.showQuickPick(
    [
      { label: 'identity', description: 'Delete one or more identities by their ID(s)', type: 'strings' },
      { label: 'access-tokens', description: 'Delete all OAuth2 Access Tokens of an OAuth2 Client', type: 'string' },
      { label: 'jwk', description: 'Delete one or more JSON Web Key Sets by their set ID', type: 'strings' },
      { label: 'oauth2-client', description: 'Delete one or more OAuth 2.0 Clients by their ID(s)', type: 'strings' },
      { label: 'relationships', description: 'Delete ALL relation tuples matching the relation query.', type: 'string' }
    ],
    { placeHolder: 'Pick to get resource...', title: 'Ory Delete', ignoreFocusOut: true }
  );
  switch (result?.label) {
    case 'identity':
      let identityDeleteCmdOutput: string[] = [];
      try {
        identityDeleteCmdOutput = await commandInput(result);
        console.log(identityDeleteCmdOutput);
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryDeleteIdentity(identityDeleteCmdOutput);

      break;
    case 'access-tokens':
      let accessTokenCmdOutput: string[] = [];

      try {
        accessTokenCmdOutput = await commandInput(result);
        console.log(accessTokenCmdOutput);
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryDeleteAccessTokens(accessTokenCmdOutput);

      break;
    case 'jwk':
      let jwkCmdOutput: string[] = [];

      try {
        jwkCmdOutput = await commandInput(result);
        console.log(jwkCmdOutput);
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryDeleteJWK(jwkCmdOutput);

      break;
    case 'oauth2-client':
      let oauth2ClientCmdOutput: string[] = [];

      try {
        oauth2ClientCmdOutput = await commandInput(result);
        console.log(oauth2ClientCmdOutput);
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryDeleteOauth2Client(oauth2ClientCmdOutput);

      break;
    case 'relationships':
      oryDeleteRelationships();

      break;
  }
}

export async function oryDeleteIdentity(identityDeleteCmdOutput: string[]): Promise<string> {
  const deleteIdentity = spawn(oryCommand, ['delete', 'identity', ...identityDeleteCmdOutput, '--format', 'json']);
  let result = '';
  await spawnCommonErrAndClose(deleteIdentity, 'project', '').then((value: string) => {
    result = value;
  });
  return result;
}

export async function oryDeleteAccessTokens(accessTokenCmdOutput: string[]) {
  const deleteAccessTokens = spawn(oryCommand, [
    'delete',
    'access-tokens',
    ...accessTokenCmdOutput,
    '--format',
    'json'
  ]);

  await spawnCommonErrAndClose(deleteAccessTokens, 'access-tokens', '');
}

export async function oryDeleteJWK(jwkCmdOutput: string[]) {
  const deleteJwk = spawn(oryCommand, ['delete', 'jwk', ...jwkCmdOutput, '--format', 'json']);

  await spawnCommonErrAndClose(deleteJwk, 'jwk', '');
}

export async function oryDeleteOauth2Client(oauth2ClientCmdOutput: string[]): Promise<string> {
  const deleteOauth2Client = spawn(oryCommand, [
    'delete',
    'oauth2-client',
    ...oauth2ClientCmdOutput,
    '--format',
    'json'
  ]);
  let result = '';
  await spawnCommonErrAndClose(deleteOauth2Client, 'oauth2-client', '').then((value: string) => {
    result = value;
  });
  return result;
}

export async function oryDeleteRelationships() {
  const flags = [
    {
      label: 'all',
      description: 'Delete all relation tuples',
      type: 'empty',
      useLabelPlaceHolder: true
    },
    {
      label: 'force',
      description: 'Force the deletion of relation tuples',
      type: 'empty'
    },
    {
      label: 'namespace',
      description: 'Set the requested namespace',
      type: 'string',
      useLabelPlaceHolder: true
    },
    {
      label: 'object',
      description: 'Set the requested object',
      type: 'string',
      useLabelPlaceHolder: true
    },
    {
      label: 'relation',
      description: 'Set the requested relation',
      type: 'string',
      useLabelPlaceHolder: true
    },
    {
      label: 'subject-id',
      description: 'Set the requested subject ID',
      type: 'string',
      useLabelPlaceHolder: true
    },
    {
      label: 'subject-set',
      description: 'Set the requested subject set; format: "namespace:object#relation"',
      type: 'string',
      useLabelPlaceHolder: true
    }
  ];

  const result = await vscode.window.showQuickPick([...flags], {
    placeHolder: 'Pick to flags...',
    title: 'Delete Relationships',
    canPickMany: true
  });

  if (result === undefined) {
    return [];
  }

  const flagsValue: Map<string, string> = new Map();

  for (let i = 0; i < result?.length; ) {
    let errorBool: Boolean = false;
    await commandInput(result[i])
      .then((value) => {
        if (value === undefined) {
          return;
        }
        flagsValue.set(result[i].label, value[0]);
        i++;
      })
      .catch((e) => {
        console.log('from relationships err: ', e);
        errorBool = true;
        return;
      });

    if (errorBool === true) {
      return [];
    }
  }

  console.log('Flag values: ' + flagsValue);
  let stringBuilder: string[] = [];
  flagsValue.forEach((value: string, key: string) => {
    if (key === 'all' || key === 'force') {
      stringBuilder.push('--' + key);
    } else {
      stringBuilder.push('--' + key + '=' + value);
    }
  });

  const deleteRelationships = spawn(oryCommand, ['delete', 'relationships', ...stringBuilder]);

  const rsp = await spawnCommonErrAndClose(deleteRelationships, 'relationships', '');
  if (rsp.includes('WARNING')) {
    let warnData = rsp.trim().split('\n');
    const viewDetails = {
      title: 'View Details',
      details() {
        let processString = rsp;
        processString = processString.replace(/\t(?!\n)/g, ' |  ');
        vscode.window.showInformationMessage('Warning: ', {
          modal: true,
          detail: `${processString}`
        });
      }
    };
    vscode.window.showWarningMessage(warnData[0] + ' ' + warnData[1], viewDetails).then((selection) => {
      if (selection) {
        selection.details();
      }
    });
  }
  console.log(rsp);
}
