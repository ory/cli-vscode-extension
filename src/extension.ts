// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { offerToInstallOry } from './installOry';
import { runOryAuth, runOryAuthLogout } from './oryAuth';
import {
  oryGetIdentity,
  oryGetIdentityConfig,
  oryGetOauth2Client,
  oryGetOauth2Config,
  oryGetPermissionConfig,
  oryGetProject,
  runOryGet
} from './oryGet';
import { format } from './helper';
import { logger } from './helper/logger';
import { ListProjectsProvider, ProjectsTreeItem } from './tree/listProjects';
import * as os from 'os';
import { runOryUse, runOryUseProject } from './oryUse';
import { IdentitiesTreeItem, ListIdentitiesProvider } from './tree/listIdentities';
import { ListOauth2ClientsProvider, Oauth2ClientsTreeItem } from './tree/listOauth2Clients';
import { ListRelationshipsProvider, RelationshipsTreeItem } from './tree/listRelationships';
import { ListRunningProcessProvider, RunningProcessTreeItem } from './tree/listTunnelProcess';
import { runOryDelete } from './oryDelete';
import { runOryCreate } from './oryCreate';
import { runOryTunnel } from './oryTunnel';
import { runOryIntrospect } from './introspect';
import {
  oryPatchIdentityConfig,
  oryPatchOAuth2Config,
  oryPatchOPL,
  oryPatchPermissionConfig,
  oryPatchProject,
  runOryPatch
} from './oryPatch';
import {
  oryUpdateIdentityConfig,
  oryUpdateOAuth2Client,
  oryUpdateOAuth2Config,
  oryUpdateOPL,
  oryUpdatePermissionConfig,
  oryUpdateProjectConfig,
  runOryUpdate
} from './oryUpdate';
import { oryImportIdentities, oryImportJWK, oryImportOAuth2Client, runOryImport } from './oryImport';

// export const outputChannel = vscode.window.createOutputChannel('Ory');

export const oryCommand: string = os.platform() === 'win32' ? 'ory.exe' : 'ory';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  logger.info('Congratulations, your extension "ory" is now active!', 'activate');

  offerToInstallOry();
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  // Projects List
  const listProjectsProvider = new ListProjectsProvider();
  vscode.window.registerTreeDataProvider('listProjects', listProjectsProvider);
  registerCommand('ory.projects.refresh', () => listProjectsProvider.refresh(), context);
  const projectView = vscode.window.createTreeView('listProjects', {
    treeDataProvider: listProjectsProvider
  });

  // Identities List
  const listIdentitiesProvider = new ListIdentitiesProvider();
  vscode.window.registerTreeDataProvider('listIdentities', listIdentitiesProvider);
  registerCommand('ory.identities.refresh', () => listIdentitiesProvider.refresh(), context);
  const identityView = vscode.window.createTreeView('listIdentities', {
    treeDataProvider: listIdentitiesProvider
  });

  // Oauth2-Clients List
  const listOauth2ClientsProvider = new ListOauth2ClientsProvider();
  vscode.window.registerTreeDataProvider('listOauth2Clients', listOauth2ClientsProvider);
  registerCommand('ory.oauth2clients.refresh', () => listOauth2ClientsProvider.refresh(), context);
  const oauth2ClientsView = vscode.window.createTreeView('listOauth2Clients', {
    treeDataProvider: listOauth2ClientsProvider
  });

  // Oauth2-Clients List
  const listRelationshipsProvider = new ListRelationshipsProvider();
  vscode.window.registerTreeDataProvider('listRelationships', listRelationshipsProvider);
  registerCommand('ory.relationships.refresh', () => listRelationshipsProvider.refresh(), context);
  const relationshipsView = vscode.window.createTreeView('listRelationships', {
    treeDataProvider: listRelationshipsProvider,
    showCollapseAll: true
  });

  // Tunnel list
  const listRunningProcessProvider = new ListRunningProcessProvider();
  vscode.window.registerTreeDataProvider('listRunningProcesses', listRunningProcessProvider);
  registerCommand('ory.tunnel.refresh', () => listRunningProcessProvider.refresh(), context);
  const tunnelView = vscode.window.createTreeView('listRunningProcesses', {
    treeDataProvider: listRunningProcessProvider
  });

  registerCommand('ory.helloWorld', () => vscode.window.showInformationMessage('Hello World from ory!'), context);
  registerCommand('ory.version', () => runOryVersion(), context);
  registerCommand('ory.activate', () => vscode.window.showInformationMessage('Ory is activated'), context);
  registerCommand('ory.promptforinstall', () => offerToInstallOry(), context);

  // Auth Command
  registerCommand('ory.auth', () => runOryAuth(), context);
  registerCommand('ory.auth.logout', () => runOryAuthLogout(), context);

  // Create Command
  registerCommand('ory.create', () => runOryCreate(), context);

  // Use Command
  registerCommand('ory.use', () => runOryUse(), context);
  registerCommand(
    'ory.use.project',
    async (node?: ProjectsTreeItem) => {
      if (node !== undefined) {
        await runOryUseProject(node?.pId, node?.pName);
      }
    },
    context
  );

  // Copy Command
  registerCommand(
    'ory.copy.projectId',
    (node?: ProjectsTreeItem) => {
      if (node !== undefined) {
        vscode.env.clipboard
          .writeText(node.pId)
          .then(() => vscode.window.showInformationMessage('Copied to clipboard!'));
      }
    },
    context
  );
  registerCommand(
    'ory.copy.relationshipString',
    async (node?: RelationshipsTreeItem) => {
      console.log(node?.relationshipString);
      if (node !== undefined) {
        vscode.env.clipboard
          .writeText(node.relationshipString)
          .then(() => vscode.window.showInformationMessage('Copied to clipboard!'));
      }
    },
    context
  );

  // Get Command
  registerCommand('ory.get', () => runOryGet(), context);
  registerCommand(
    'ory.get.projectConfig',
    async (node?: ProjectsTreeItem) => {
      console.log(node?.pId);
      if (node !== undefined) {
        await format('project').then((val) => {
          oryGetProject([node?.pId], val);
        });
      }
    },
    context
  );
  registerCommand(
    'ory.get.identityConfig',
    async (node?: ProjectsTreeItem) => {
      console.log(node?.pId);
      if (node !== undefined) {
        await format('identityConfig').then((val) => {
          oryGetIdentityConfig([node?.pId], val);
        });
      }
    },
    context
  );
  registerCommand(
    'ory.get.oauth2Config',
    async (node?: ProjectsTreeItem) => {
      console.log(node?.pId);
      if (node !== undefined) {
        await format('oauth2Config').then((val) => {
          oryGetOauth2Config([node?.pId], val);
        });
      }
    },
    context
  );
  registerCommand(
    'ory.get.permissionConfig',
    async (node?: ProjectsTreeItem) => {
      console.log(node?.pId);
      if (node !== undefined) {
        await format('permissionConfig').then((val) => {
          oryGetPermissionConfig([node?.pId], val);
        });
      }
    },
    context
  );
  registerCommand(
    'ory.get.oauth2Client',
    async (node?: Oauth2ClientsTreeItem) => {
      console.log(node?.clientID);
      if (node !== undefined) {
        await format('oauth2Client').then((val) => {
          oryGetOauth2Client([node?.clientID], val);
        });
      }
    },
    context
  );
  registerCommand(
    'ory.copy.oauth2ClientID',
    (node?: Oauth2ClientsTreeItem) => {
      if (node !== undefined) {
        vscode.env.clipboard
          .writeText(node.clientID)
          .then(() => vscode.window.showInformationMessage('Copied to clipboard!'));
      }
    },
    context
  );
  registerCommand(
    'ory.get.identity',
    async (node?: IdentitiesTreeItem) => {
      console.log(node?.iId);
      if (node !== undefined) {
        await format('identity').then((val) => {
          oryGetIdentity([node?.iId], val);
        });
      }
    },
    context
  );

  registerCommand(
    'ory.copy.identityID',
    async (node?: IdentitiesTreeItem) => {
      console.log(node?.iId);
      if (node !== undefined) {
        vscode.env.clipboard
          .writeText(node.iId)
          .then(() => vscode.window.showInformationMessage('Copied to clipboard!'));
      }
    },
    context
  );
  registerCommand('ory.update', () => runOryUpdate(), context);
  registerCommand(
    'ory.update.identityConfig',
    async (node?: ProjectsTreeItem) => {
      console.log(node?.pId);
      if (node !== undefined) {
        await oryUpdateIdentityConfig([node.pId]);
      }
    },
    context
  );
  registerCommand(
    'ory.update.oauth2Client',
    async (node?: Oauth2ClientsTreeItem) => {
      console.log(node?.clientID);
      if (node !== undefined) {
        await oryUpdateOAuth2Client(node.clientID);
      }
    },
    context
  );
  registerCommand(
    'ory.update.oauth2Config',
    async (node?: ProjectsTreeItem) => {
      console.log(node?.pId);
      if (node !== undefined) {
        await oryUpdateOAuth2Config([node.pId]);
      }
    },
    context
  );
  registerCommand(
    'ory.update.OPL',
    async (node?: ProjectsTreeItem) => {
      console.log(node?.pId);
      if (node !== undefined) {
        await oryUpdateOPL([node.pId]);
      }
    },
    context
  );
  registerCommand(
    'ory.update.permissionConfig',
    async (node?: ProjectsTreeItem) => {
      console.log(node?.pId);
      if (node !== undefined) {
        await oryUpdatePermissionConfig([node.pId]);
      }
    },
    context
  );
  registerCommand(
    'ory.update.projectConfig',
    async (node?: ProjectsTreeItem) => {
      console.log(node?.pId);
      if (node !== undefined) {
        await oryUpdateProjectConfig([node.pId]);
      }
    },
    context
  );
  registerCommand('ory.delete', () => runOryDelete(), context);
  registerCommand(
    'ory.delete.identity',
    async (node?: IdentitiesTreeItem) => {
      console.log(node?.iId);
      if (node !== undefined) {
        listIdentitiesProvider.delete(node.iId);
      }
    },
    context
  );
  registerCommand(
    'ory.delete.oauth2Client',
    async (node?: Oauth2ClientsTreeItem) => {
      console.log(node?.clientID);
      if (node !== undefined) {
        listOauth2ClientsProvider.delete(node.clientID);
      }
    },
    context
  );

  registerCommand('ory.tunnel', () => runOryTunnel(listRunningProcessProvider), context);
  registerCommand(
    'ory.tunnel.stopProcess',
    async (node?: RunningProcessTreeItem) => {
      console.log(node?.runningPS.processName);
      if (node !== undefined) {
        listRunningProcessProvider.remove(node.runningPS.id);
      }
    },
    context
  );
  
  registerCommand('ory.introspect.token', () => runOryIntrospect(), context);

  // Patch Command
  registerCommand('ory.patch', () => runOryPatch(), context);
  registerCommand(
    'ory.identities.patchConfig',
    () =>
      oryPatchIdentityConfig({
        label: 'identity-config',
        description: 'Patch the Ory Identities configuration of the defined Ory Network project.'
      }),
    context
  );
  registerCommand(
    'ory.oauth2clients.patchConfig',
    () => {
      oryPatchOAuth2Config({
        label: 'oauth2-config',
        description: 'Patch the Ory OAuth2 & OpenID Connect configuration of the specified Ory Network project.'
      });
    },
    context
  );
  registerCommand(
    'ory.relationships.patchConfig',
    () =>
      oryPatchPermissionConfig({
        label: 'permission-config',
        description: 'Patch the Ory Permissions configuration of the specified Ory Network project.'
      }),
    context
  );
  registerCommand(
    'ory.projects.patchConfig',
    () =>
      oryPatchProject({
        label: 'project',
        description: 'Patch the Ory Network project configuration.'
      }),
    context
  );
  registerCommand(
    'ory.relationships.patchOPL',
    () => oryPatchOPL({ label: 'opl', description: 'Update the Ory Permission Language file in Ory Network.' }),
    context
  );

  // Import Command
  registerCommand('ory.import', () => runOryImport(), context);
  registerCommand(
    'ory.import.identities',
    () =>
      oryImportIdentities({
        label: 'identities',
        description: 'Import one or more identities from files'
      }),
    context
  );
  registerCommand(
    'ory.import.jwk',
    () => {
      oryImportJWK({
        label: 'jwk',
        description: 'Imports JSON Web Keys from one or more JSON files.'
      });
    },
    context
  );
  registerCommand(
    'ory.import.oauth2Client',
    () =>
      oryImportOAuth2Client({ label: 'oauth2-client', description: 'Import one or more OAuth 2.0 Clients from files' }),
    context
  );

  context.subscriptions.push(projectView, identityView, oauth2ClientsView, relationshipsView);
}

// This method is called when your extension is deactivated
export function deactivate() {
  logger.info('Extension deactivated', 'deactivate');
}

function registerCommand(command: string, callback: (...args: any[]) => any, ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(vscode.commands.registerCommand(command, callback));
}

function runOryVersion() {
  exec('ory version', (error: Error | null, stdout: string, stderr: string) => {
    if (error) {
      logger.error(`error: ${error.message}`, 'ory-version');
      return;
    }
    if (stderr) {
      logger.error(`stderr: ${stderr}`, 'ory-version');
      return;
    }
    vscode.window.showInformationMessage(`${stdout}`, {
      modal: true
    });
  });
}
