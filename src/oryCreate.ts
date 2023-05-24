import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { outputChannel } from './extension';
import * as os from 'os';

const oryCommand: string = os.platform() === 'win32' ? 'ory.exe' : 'ory';

export async function runOryCreate() {
  const result = await vscode.window.showQuickPick(
    [
      { label: 'jwk', description: 'Create a JSON Web Key Set with a JSON Web Key' },
      { label: 'oauth2-client', description: 'Create an OAuth 2.0 Client' },
      { label: 'project', description: 'Create a new Ory Network project' },
      { label: 'relationships', description: 'Create relation tuples from JSON files' }
    ],
    { placeHolder: 'Pick to create...', title: 'Ory Create' }
  );

  switch (result?.label) {
    case 'jwk':
      console.log(`Got: jwk`);
      const jwkSetInput = await vscode.window.showInputBox({
        title: 'JWK Set ID',
        placeHolder: '<my-jwk-set>'
      });

      if (jwkSetInput === undefined) {
        vscode.window.showErrorMessage(`Invalid jwk set id ${jwkSetInput}`);
        return;
      }

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

      const intendedUse = await vscode.window.showQuickPick([{ label: 'sig', picked: true }, { label: 'enc' }], {
        placeHolder: 'Select intended use of this key. (default "sig")',
        title: 'Use'
      });
      const createJWK = spawn(oryCommand, [
        'create',
        'jwk',
        `${jwkSetInput}`,
        '--alg',
        `${algorithm?.label}`,
        '--use',
        `${intendedUse?.label}`
      ]);

      createJWK.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        if (data.includes(`SET ID\tKEY ID`) || data.includes(`${jwkSetInput}`)) {
          const viewDetails = {
            title: 'View Details',
            details() {
              let processString = String(data).split('\n');
              let resultString = '';

              let headings = processString[0].split('\t').filter((element) => {
                return element !== '';
              });
              let values = processString[1].split('\t').filter((element) => {
                return element !== '';
              });

              for (let i = 0; i < headings.length; i++) {
                resultString += headings[i] + ': ' + values[i] + '\n';
              }
              vscode.window.showInformationMessage('Created JWK', {
                modal: true,
                detail: `${resultString}`
              });
            }
          };
          vscode.window.showInformationMessage(`JWK created successfully!`, viewDetails).then((selection) => {
            if (selection) {
              selection.details();
            }
          });
        }
      });

      createJWK.stderr.on('data', (data) => {
        outputChannel.append('\n' + String(data));
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
          createProject.kill();
        }
      });

      createJWK.on('close', (code) => {
        outputChannel.append(`\nprocess exited with code ${code}`);
        console.log(`child process exited with code ${code}`);
      });
      break;
    case 'oauth2-client':
      vscode.window.showInformationMessage(`Got: oauth2-client`);
      break;
    case 'project':
      console.log('Got: project');
      const projectNameInput = await vscode.window.showInputBox({
        title: 'Project Name',
        placeHolder: 'Enter ory project name'
      });

      if (projectNameInput === undefined) {
        vscode.window.showErrorMessage(`Invalid project name ${projectNameInput}`);
        return;
      }

      const createProject = spawn(oryCommand, ['create', 'project', '--name', `${projectNameInput}`]);

      createProject.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        if (data.includes(`NAME\t${projectNameInput}`)) {
          const viewDetails = {
            title: 'View Details',
            details() {
              let processString = String(data).split('\n');
              processString.map((element, index) => {
                processString[index] = element.replace('\t', ': ');
              });
              vscode.window.showInformationMessage('Project Information', {
                modal: true,
                detail: `${processString.join('\n')}`
              });
            }
          };
          vscode.window.showInformationMessage(`Project created successfully!`, viewDetails).then((selection) => {
            if (selection) {
              selection.details();
            }
          });
        }
      });

      createProject.stderr.on('data', (data) => {
        outputChannel.append('\n' + String(data));
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
          createProject.kill();
        }
      });

      createProject.on('close', (code) => {
        outputChannel.append(`\nprocess exited with code ${code}`);
        console.log(`child process exited with code ${code}`);
      });

      break;
    case 'relationships':
      vscode.window.showInformationMessage(`Got: relationships`);
      break;
    default:
      break;
  }
}
