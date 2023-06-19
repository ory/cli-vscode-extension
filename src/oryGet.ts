import * as vscode from 'vscode';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { outputChannel } from './extension';
import * as os from 'os';

const oryCommand: string = os.platform() === 'win32' ? 'ory.exe' : 'ory';

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
    { placeHolder: 'Pick to get resource...', title: 'Ory Get' }
  );
  switch (result?.label) {
    case 'identity':
      let identityOutputFormat: string = '';
      let identityCommandOutput: string[] = [];
      await commandInput(result)
        .then((inputValue) => {
          identityCommandOutput = inputValue;
          console.log(identityCommandOutput);
        })
        .catch((err) => {
          console.error(err);
          vscode.window.showErrorMessage(err);
          return;
        });

      await format('identity').then((val) => {
        identityOutputFormat = val;
      });

      const getIdentity = spawn(oryCommand, ['get', 'identity', ...identityCommandOutput, '--format', `${identityOutputFormat}`]);

      getIdentity.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        vscode.window.showInformationMessage('Got the identity successfully');
        let jsonOrYamlExt: string = identityOutputFormat.includes('json') ? 'json' : 'yaml';
        webViewPanel('identityPanel', result?.label +'-'+ jsonOrYamlExt, vscode.ViewColumn.Beside, data);
      });

      spwanCommonErrAndClose(getIdentity);

      break;
    case 'identity-config':
      let identityConfigOutputFormat: string = '';
      let identityConfigcommandOutput: string[] = [];
      await commandInput(result)
        .then((inputValue) => {
          identityConfigcommandOutput = inputValue;
          console.log(identityConfigcommandOutput);
        })
        .catch((err) => {
          console.error(err);
          vscode.window.showErrorMessage(err);
          return;
        });

      await format('identity-config').then((val) => {
        identityConfigOutputFormat = val;
      });

      const getIdentityConfig = spawn(oryCommand, ['get', 'identity-config', ...identityConfigcommandOutput, '--format', `${identityConfigOutputFormat}`]);
      
      getIdentityConfig.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        vscode.window.showInformationMessage('Got the identity-config successfully');
        let jsonOrYamlExt: string = identityConfigOutputFormat.includes('json') ? 'json' : 'yaml';
        webViewPanel('identityConfigPanel', result?.label +'-'+ jsonOrYamlExt, vscode.ViewColumn.Beside, data);
      });

      spwanCommonErrAndClose(getIdentityConfig);

      break;
    case 'jwk':
      let jwkConfigOutputFormat: string = '';
      let jwkConfigcommandOutput: string[] = [];
      await commandInput(result)
        .then((inputValue) => {
          jwkConfigcommandOutput = inputValue;
          console.log(jwkConfigcommandOutput);
        })
        .catch((err) => {
          console.error(err);
          vscode.window.showErrorMessage(err);
          return;
        });

      await format('jwk').then((val) => {
        jwkConfigOutputFormat = val;
      });

      const getJWK = spawn(oryCommand, ['get', 'jwk', ...jwkConfigcommandOutput, '--format', `${jwkConfigOutputFormat}`]);
      
      getJWK.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        vscode.window.showInformationMessage('Got the JWK successfully');
        let jsonOrYamlExt: string = jwkConfigOutputFormat.includes('json') ? 'json' : 'yaml';
        webViewPanel('jwkPanel', result?.label +'-'+ jsonOrYamlExt, vscode.ViewColumn.Beside, data);
      });

      spwanCommonErrAndClose(getJWK);

      break;
    case 'oauth2-client':
      let oauth2ClientOutputFormat: string = '';
      let oauth2ClientcommandOutput: string[] = [];
      await commandInput(result)
        .then((inputValue) => {
          oauth2ClientcommandOutput = inputValue;
          console.log(oauth2ClientcommandOutput);
        })
        .catch((err) => {
          console.error(err);
          vscode.window.showErrorMessage(err);
          return;
        });

      await format('jwk').then((val) => {
        oauth2ClientOutputFormat = val;
      });

      const getOauth2Client = spawn(oryCommand, ['get', 'oauth2-client', ...oauth2ClientcommandOutput, '--format', `${oauth2ClientOutputFormat}`]);
      
      getOauth2Client.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        vscode.window.showInformationMessage('Got the oauth2-client successfully');
        let jsonOrYamlExt: string = oauth2ClientOutputFormat.includes('json') ? 'json' : 'yaml';
        webViewPanel('oauth2ClientPanel', result?.label +'-'+ jsonOrYamlExt, vscode.ViewColumn.Beside, data);
      });

      spwanCommonErrAndClose(getOauth2Client);

      break;
    case 'oauth2-config':
      let oauth2ConfigOutputFormat: string = '';
      let oauth2ConfigcommandOutput: string[] = [];
      await commandInput(result)
        .then((inputValue) => {
          oauth2ConfigcommandOutput = inputValue;
          console.log(oauth2ConfigcommandOutput);
        })
        .catch((err) => {
          console.error(err);
          vscode.window.showErrorMessage(err);
          return;
        });

      await format('oauth2-config').then((val) => {
        oauth2ConfigOutputFormat = val;
      });

      const getOauth2Config = spawn(oryCommand, ['get', 'oauth2-config', ...oauth2ConfigcommandOutput, '--format', `${oauth2ConfigOutputFormat}`]);
      
      getOauth2Config.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        vscode.window.showInformationMessage('Got the oauth2-config successfully');
        let jsonOrYamlExt: string = oauth2ConfigOutputFormat.includes('json') ? 'json' : 'yaml';
        webViewPanel('oauth2ConfigPanel', result?.label +'-'+ jsonOrYamlExt, vscode.ViewColumn.Beside, data);
      });

      spwanCommonErrAndClose(getOauth2Config);

      break;
    case 'permission-config':
      let permissionConfigOutputFormat: string = '';
      let permissionConfigcommandOutput: string[] = [];
      await commandInput(result)
        .then((inputValue) => {
          permissionConfigcommandOutput = inputValue;
          console.log(permissionConfigcommandOutput);
        })
        .catch((err) => {
          console.error(err);
          vscode.window.showErrorMessage(err);
          return;
        });

      await format('permission-config').then((val) => {
        permissionConfigOutputFormat = val;
      });

      const getPermissionConfig = spawn(oryCommand, ['get', 'permission-config', ...permissionConfigcommandOutput, '--format', `${permissionConfigOutputFormat}`]);
      
      getPermissionConfig.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        vscode.window.showInformationMessage('Got the permission-config successfully');
        let jsonOrYamlExt: string = permissionConfigOutputFormat.includes('json') ? 'json' : 'yaml';
        webViewPanel('permissionConfigPanel', result?.label +'-'+ jsonOrYamlExt, vscode.ViewColumn.Beside, data);
      });

      spwanCommonErrAndClose(getPermissionConfig);

      break;
    case 'project':
      let projectOutputFormat: string = '';
      let projectcommandOutput: string[] = [];
      await commandInput(result)
        .then((inputValue) => {
          projectcommandOutput = inputValue;
          console.log(projectcommandOutput);
        })
        .catch((err) => {
          console.error(err);
          vscode.window.showErrorMessage(err);
          return;
        });

      await format('project').then((val) => {
        projectOutputFormat = val;
      });

      const getProject = spawn(oryCommand, ['get', 'project', ...projectcommandOutput, '--format', `${projectOutputFormat}`]);
      
      getProject.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        vscode.window.showInformationMessage('Got the project successfully');
        let jsonOrYamlExt: string = projectOutputFormat.includes('json') ? 'json' : 'yaml';
        webViewPanel('projectPanel', result?.label +'-'+ jsonOrYamlExt, vscode.ViewColumn.Beside, data);
      });

      spwanCommonErrAndClose(getProject);

      break;
  }
}

function webViewPanel(viewType: string, title: string, showOptions: vscode.ViewColumn, output: any) {
  const panel = vscode.window.createWebviewPanel(viewType, title, showOptions, { enableScripts: true });
  const htmlContent = `
        <html>
            <body>
                <pre>${output}</pre>
            </body>
        </html>
        `;
  panel.webview.html = htmlContent;
}

async function format(cmd: string): Promise<string> {
  const formatInput = await vscode.window.showQuickPick(
    [{ label: 'json', picked: true }, { label: 'yaml' }, { label: 'json-pretty' }],
    { title: `${cmd} format`, placeHolder: 'Set the output format' }
  );

  switch (formatInput?.label) {
    case 'yaml':
      return 'yaml';
    case 'json-pretty':
      return 'json-pretty';
    default:
      return 'json';
  }
}

async function commandInput(obj: { label: string; description: string; type: string }): Promise<string[]> {
  let resultString: string[] = [];
  let input = await vscode.window.showInputBox({
    title: obj.label,
    placeHolder:
      obj.type === 'string' ? 'Enter project id' : 'Enter multiple inputs "," (comma-separated). ex- id-1, id-2',
    prompt: obj.description
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

function spwanCommonErrAndClose(spawnObj: ChildProcessWithoutNullStreams) {
  spawnObj.stderr.on('data', (data) => {
    outputChannel.append('\nError: ' + String(data));
    console.error(`stderr: ${data}`);
    if (data.includes('Your session has expired or has otherwise become invalid')) {
      const reAuthenticate = {
        title: 'Re-authenticate',
        command() {
          vscode.commands.executeCommand('ory.auth');
        }
      };
      vscode.window.showErrorMessage(`${data}`, reAuthenticate).then((selection) => {
        if (selection) {
          selection.command();
        }
      });
      spawnObj.kill();
    }
    if(data.includes('Error: no project was specified')){
      vscode.window.showErrorMessage('No project id was specified');
    } else {
      vscode.window.showErrorMessage('Opps 🫢 something went wrong! Please check in Output -> Ory');
    }
  });

  spawnObj.on('close', (code) => {
    outputChannel.append(`\nprocess exited with code ${code}`);
    console.log(`child process exited with code ${code}`);
  });
}