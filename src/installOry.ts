import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as os from 'os';
import { outputChannel } from './extension';

let alreadyOfferedToInstallOry = false;

export async function offerToInstallOry() {
  outputChannel.clear();
  if (alreadyOfferedToInstallOry) {
    vscode.window.showInformationMessage('Ory Cli is already installed.');
    return;
  }

  await runCommand('ory version')
    .then((result) => {
      console.log(result);
      alreadyOfferedToInstallOry = true;
    })
    .catch((err) => {
      console.error(err);
      outputChannel.appendLine(err);
      const installItem = {
        title: 'Install',
        async command() {
          // Install ory cli
          console.log('Installing ory');
          outputChannel.appendLine('Installing Ory Cli...');
          installOryCli();
        }
      };
      const checkDoc = {
        title: 'Check Docs',
        command() {
          vscode.env.openExternal(vscode.Uri.parse('https://www.ory.sh/docs/guides/cli/installation'));
        }
      };
      vscode.window
        .showInformationMessage('Failed to find Ory CLI. Would you like to install Ory CLI?', installItem, checkDoc)
        .then((selection) => {
          if (selection) {
            selection.command();
          }
        });
    });
}

async function installOryCli() {
  switch (os.platform()) {
    case 'darwin':
      await runCommand('brew install ory/tap/cli')
        .then((result) => {
          alreadyOfferedToInstallOry = true;
          console.log('Ory Cli install successfully. ' + result);
          outputChannel.appendLine('Ory Cli install successfully. ' + result);
        })
        .catch((err) => {
          console.error(err);
          let errString = err.message;
          outputChannel.appendLine(err);
          if (errString.includes('-bash: brew: command not found')) {
            const installItem = {
              title: 'Install Brew',
              command() {
                runCommand(
                  '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
                )
                  .then((result) => {
                    console.log('Brew install successfully. ' + result);
                    vscode.window.showInformationMessage('Brew was installed successfully!');
                    outputChannel.appendLine('Brew was installed successfully!');
                    offerToInstallOry();
                  })
                  .catch((err) => {
                    console.error(err);
                    outputChannel.appendLine(err);
                  });
              }
            };
            const checkDoc = {
              title: 'Check Docs',
              command() {
                vscode.env.openExternal(vscode.Uri.parse('https://www.ory.sh/docs/guides/cli/installation#macos'));
              }
            };
            vscode.window
              .showErrorMessage('Failed to run brew. Would you like to install brew?', installItem, checkDoc)
              .then((selection) => {
                if (selection) {
                  selection.command();
                }
              });
          }
        });
      break;
    case 'linux':
      await runCommand(
        "bash -c 'bash <(curl https://raw.githubusercontent.com/ory/meta/master/install.sh) -b . ory && mv ./ory /usr/local/bin/'"
      )
        .then((result) => {
          alreadyOfferedToInstallOry = true;
          console.log('Ory Cli install successfully');
          outputChannel.appendLine('Ory Cli install successfully');
        })
        .catch((err) => {
          console.error(err);
          var errString = err.message;
          if (errString.includes('ory/ info installed ./ory')) {
            vscode.window.showInformationMessage('Ory Cli was installed successfully!');
          }
          outputChannel.appendLine(err);
        });
      break;
    case 'win32':
      await runCommand('scoop bucket add ory https://github.com/ory/scoop.git && scoop install ory')
        .then((result) => {
          alreadyOfferedToInstallOry = true;
          console.log('Ory Cli install successfully. ' + result);
          let oryVersionMessage = result.split('\n');
          if (oryVersionMessage[oryVersionMessage.length - 1] === '') {
            vscode.window.showInformationMessage(oryVersionMessage[oryVersionMessage.length - 2]);
          } else {
            vscode.window.showInformationMessage('Ory Cli was installed successfully!');
          }
          outputChannel.appendLine('Ory Cli install successfully');
        })
        .catch((err) => {
          console.error(err.message);
          var errString = err.message;
          outputChannel.appendLine(err.message);
          if (errString.includes(`'scoop' is not recognized as an internal or external command`)) {
            const installItem = {
              title: 'Install Scoop',
              command() {
                runCommand(
                  'powershell -command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser; irm get.scoop.sh | iex"'
                )
                  .then((result) => {
                    console.log('Scoop install successfully. ' + result);
                    vscode.window.showInformationMessage('scoop was installed successfully!');
                    outputChannel.appendLine('scoop was installed successfully!');
                    offerToInstallOry();
                  })
                  .catch((err) => {
                    console.error(err);
                    outputChannel.appendLine(err);
                  });
              }
            };
            const checkDoc = {
              title: 'Check Docs',
              command() {
                vscode.env.openExternal(vscode.Uri.parse('https://www.ory.sh/docs/guides/cli/installation#windows'));
              }
            };
            vscode.window
              .showErrorMessage('Failed to run scoop. Would you like to install scoop?', installItem, checkDoc)
              .then((selection) => {
                if (selection) {
                  selection.command();
                }
              });
          }
        });
      break;
    default:
      console.warn('Not able to recoginize the OS!!!');
      outputChannel.appendLine('Not able to recoginize the OS!!!');
      break;
  }
}

async function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`${command}`, (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        //   console.log(`error: ${error.message}`);
        reject(new Error(`${error.message}`));
      }
      if (stderr) {
        //   console.log(`stderr: ${stderr}`);
        reject(new Error(`${stderr}`));
      }
      resolve(stdout);
    });
  });
}
