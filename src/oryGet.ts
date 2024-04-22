import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { oryCommand } from './extension';
import { logger } from './helper/logger';
import { format, spawnCommonErrAndClose, commandInput } from './helper';

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
        logger.error(`Error: ${err.message}`, 'get-identity');
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
        logger.error(`Error: ${err.message}`, 'get-identity-config');
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
        logger.error(`Error: ${err.message}`, 'get-jwk');
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
        logger.error(`Error: ${err.message}`, 'get-oauth2-client');
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
        logger.error(`Error: ${err.message}`, 'get-oauth2-config');
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
        logger.error(`Error: ${err.message}`, 'get-permission-config');
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
        logger.error(`Error: ${err.message}`, 'get-project');
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

  spawnCommonErrAndClose(getProject, 'project', projectOutputFormat);
}

export function oryGetPermissionConfig(permissionConfigCommandOutput: string[], permissionConfigOutputFormat: string) {
  const getPermissionConfig = spawn(oryCommand, [
    'get',
    'permission-config',
    ...permissionConfigCommandOutput,
    '--format',
    `${permissionConfigOutputFormat}`
  ]);

  spawnCommonErrAndClose(getPermissionConfig, 'permissionConfig', permissionConfigOutputFormat);
}

export function oryGetOauth2Config(oauth2ConfigCommandOutput: string[], oauth2ConfigOutputFormat: string) {
  const getOauth2Config = spawn(oryCommand, [
    'get',
    'oauth2-config',
    ...oauth2ConfigCommandOutput,
    '--format',
    `${oauth2ConfigOutputFormat}`
  ]);

  spawnCommonErrAndClose(getOauth2Config, 'oauth2Config', oauth2ConfigOutputFormat);
}

export function oryGetOauth2Client(oauth2ClientCommandOutput: string[], oauth2ClientOutputFormat: string) {
  const getOauth2Client = spawn(oryCommand, [
    'get',
    'oauth2-client',
    ...oauth2ClientCommandOutput,
    '--format',
    `${oauth2ClientOutputFormat}`
  ]);

  spawnCommonErrAndClose(getOauth2Client, 'oauth2Client', oauth2ClientOutputFormat);
}

export function oryGetJWK(jwkConfigCommandOutput: string[], jwkConfigOutputFormat: string) {
  const getJWK = spawn(oryCommand, ['get', 'jwk', ...jwkConfigCommandOutput, '--format', `${jwkConfigOutputFormat}`]);

  spawnCommonErrAndClose(getJWK, 'jwk', jwkConfigOutputFormat);
}

export function oryGetIdentityConfig(identityConfigCommandOutput: string[], identityConfigOutputFormat: string) {
  const getIdentityConfig = spawn(oryCommand, [
    'get',
    'identity-config',
    ...identityConfigCommandOutput,
    '--format',
    `${identityConfigOutputFormat}`
  ]);

  spawnCommonErrAndClose(getIdentityConfig, 'identityConfig', identityConfigOutputFormat);
}

export function oryGetIdentity(identityCommandOutput: string[], identityOutputFormat: string) {
  const getIdentity = spawn(oryCommand, [
    'get',
    'identity',
    ...identityCommandOutput,
    '--format',
    `${identityOutputFormat}`
  ]);

  spawnCommonErrAndClose(getIdentity, 'identity', identityOutputFormat);
}
