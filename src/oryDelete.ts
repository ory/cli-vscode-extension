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
      let relationshipsCmdOutput: string[] = [];

      try {
        relationshipsCmdOutput = await commandInput(result);
        console.log(relationshipsCmdOutput);
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryDeleteRelationships(relationshipsCmdOutput);

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

export async function oryDeleteRelationships(relationshipsCmdOutput: string[]) {
  const deleteRelationships = spawn(oryCommand, [
    'delete',
    'relationships',
    ...relationshipsCmdOutput,
    '--format',
    'json'
  ]);

  await spawnCommonErrAndClose(deleteRelationships, 'relationships', '');
}
