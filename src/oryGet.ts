import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { outputChannel, oryCommand } from './extension';
import { format, spwanCommonErrAndClose, webViewPanel } from './helper';

export async function runOryGet() {
  const result = await vscode.window.showQuickPick(
    [
      { label: 'identity', description: 'Get one or more identities by their ID(s)', type: 'strings' },
      { label: 'identity-config', description: 'Get Ory Identities configuration.', type: 'string' },
      { label: 'jwk', description: 'Get one or more JSON Web Key Set by its ID(s)', type: 'strings' },
      { label: 'oauth2-client', description: 'Get one or more OAuth 2.0 Clients by their ID(s)', type: 'strings' },
      { label: 'oauth2-config', description: 'Get Ory OAuth2 & OpenID Connect configuration.', type: 'string' },
      { label: 'permission-config', description: 'Get Ory Permissions configuration.', type: 'string' },
      { label: 'project', description: 'Get the complete configuration of an Ory Network project.', type: 'string' }
    ],
    { placeHolder: 'Pick to get resource...', title: 'Ory Get', ignoreFocusOut: true }
  );
  switch (result?.label) {
    case 'identity':
      let identityOutputFormat: string = '';
      let identityCommandOutput: string[] = [];
      try {
        identityCommandOutput = await commandInput(result);
        console.log(identityCommandOutput);
        identityOutputFormat = await format('identity');
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryGetIdentity(identityCommandOutput, identityOutputFormat);

      break;
    case 'identity-config':
      let identityConfigOutputFormat: string = '';
      let identityConfigCommandOutput: string[] = [];

      try {
        identityConfigCommandOutput = await commandInput(result);
        console.log(identityConfigCommandOutput);
        identityConfigOutputFormat = await format('identity-config');
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryGetIdentityConfig(identityConfigCommandOutput, identityConfigOutputFormat);

      break;
    case 'jwk':
      let jwkConfigOutputFormat: string = '';
      let jwkConfigCommandOutput: string[] = [];

      try {
        jwkConfigCommandOutput = await commandInput(result);
        console.log(jwkConfigCommandOutput);
        jwkConfigOutputFormat = await format('jwk');
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryGetJWK(jwkConfigCommandOutput, jwkConfigOutputFormat);

      break;
    case 'oauth2-client':
      let oauth2ClientOutputFormat: string = '';
      let oauth2ClientCommandOutput: string[] = [];

      try {
        oauth2ClientCommandOutput = await commandInput(result);
        console.log(oauth2ClientCommandOutput);
        oauth2ClientOutputFormat = await format('oauth2-client');
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryGetOauth2Client(oauth2ClientCommandOutput, oauth2ClientOutputFormat);

      break;
    case 'oauth2-config':
      let oauth2ConfigOutputFormat: string = '';
      let oauth2ConfigCommandOutput: string[] = [];

      try {
        oauth2ConfigCommandOutput = await commandInput(result);
        console.log(oauth2ConfigCommandOutput);
        oauth2ConfigOutputFormat = await format('oauth2-config');
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryGetOauth2Config(oauth2ConfigCommandOutput, oauth2ConfigOutputFormat);

      break;
    case 'permission-config':
      let permissionConfigOutputFormat: string = '';
      let permissionConfigCommandOutput: string[] = [];

      try {
        permissionConfigCommandOutput = await commandInput(result);
        console.log(permissionConfigCommandOutput);
        permissionConfigOutputFormat = await format('permission-config');
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryGetPermissionConfig(permissionConfigCommandOutput, permissionConfigOutputFormat);

      break;
    case 'project':
      let projectOutputFormat: string = '';
      let projectCommandOutput: string[] = [];

      try {
        projectCommandOutput = await commandInput(result);
        console.log(projectCommandOutput);
        projectOutputFormat = await format('project');
      } catch (err: any) {
        console.error(`[${result?.label}] Error: ${err.message}`);
        outputChannel.append(`[${result?.label}] Error: ${err.message}`);
        return;
      }

      oryGetProject(projectCommandOutput, projectOutputFormat);

      break;
  }
}

export function oryGetProject(projectCommandOutput: string[], projectOutputFormat: string) {
  const getProject = spawn(oryCommand, [
    'get',
    'project',
    ...projectCommandOutput,
    '--format',
    `${projectOutputFormat}`
  ]);

  spwanCommonErrAndClose(getProject, 'project', projectOutputFormat);
}

export function oryGetPermissionConfig(permissionConfigCommandOutput: string[], permissionConfigOutputFormat: string) {
  const getPermissionConfig = spawn(oryCommand, [
    'get',
    'permission-config',
    ...permissionConfigCommandOutput,
    '--format',
    `${permissionConfigOutputFormat}`
  ]);

  spwanCommonErrAndClose(getPermissionConfig, 'permissionConfig', permissionConfigOutputFormat);
}

export function oryGetOauth2Config(oauth2ConfigCommandOutput: string[], oauth2ConfigOutputFormat: string) {
  const getOauth2Config = spawn(oryCommand, [
    'get',
    'oauth2-config',
    ...oauth2ConfigCommandOutput,
    '--format',
    `${oauth2ConfigOutputFormat}`
  ]);

  spwanCommonErrAndClose(getOauth2Config, 'oauth2Config', oauth2ConfigOutputFormat);
}

export function oryGetOauth2Client(oauth2ClientCommandOutput: string[], oauth2ClientOutputFormat: string) {
  const getOauth2Client = spawn(oryCommand, [
    'get',
    'oauth2-client',
    ...oauth2ClientCommandOutput,
    '--format',
    `${oauth2ClientOutputFormat}`
  ]);

  spwanCommonErrAndClose(getOauth2Client, 'oauth2Client', oauth2ClientOutputFormat);
}

export function oryGetJWK(jwkConfigCommandOutput: string[], jwkConfigOutputFormat: string) {
  const getJWK = spawn(oryCommand, ['get', 'jwk', ...jwkConfigCommandOutput, '--format', `${jwkConfigOutputFormat}`]);

  spwanCommonErrAndClose(getJWK, 'jwk', jwkConfigOutputFormat);
}

export function oryGetIdentityConfig(identityConfigCommandOutput: string[], identityConfigOutputFormat: string) {
  const getIdentityConfig = spawn(oryCommand, [
    'get',
    'identity-config',
    ...identityConfigCommandOutput,
    '--format',
    `${identityConfigOutputFormat}`
  ]);

  spwanCommonErrAndClose(getIdentityConfig, 'identityConfig', identityConfigOutputFormat);
}

export function oryGetIdentity(identityCommandOutput: string[], identityOutputFormat: string) {
  const getIdentity = spawn(oryCommand, [
    'get',
    'identity',
    ...identityCommandOutput,
    '--format',
    `${identityOutputFormat}`
  ]);

  spwanCommonErrAndClose(getIdentity, 'identity', identityOutputFormat);
}

async function commandInput(obj: { label: string; description: string; type: string }): Promise<string[]> {
  let resultString: string[] = [];
  let input = await vscode.window.showInputBox({
    title: obj.label,
    placeHolder:
      obj.type === 'string' ? 'Enter project id' : 'Enter multiple inputs "," (comma-separated). ex- id-1, id-2',
    prompt: obj.description,
    ignoreFocusOut: true
  });

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
