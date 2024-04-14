import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as os from 'os';
// import { outputChannel } from './extension';
import { logger } from './helper/logger';

let alreadyOfferedToInstallOry = false;

export async function offerToInstallOry() {
  // outputChannel.clear();
  if (alreadyOfferedToInstallOry) {
    vscode.window.showInformationMessage('Ory Cli is already installed.');
    logger.info('Ory Cli is already installed.', 'offerToInstallOry');
    return;
  }

  await runCommand('ory version')
    .then((result) => {
      logger.debug(result, 'offerToInstallOry');
      alreadyOfferedToInstallOry = true;
    })
    .catch((err) => {
      logger.error(err, 'offerToInstallOry');
      const installItem = {
        title: 'Install',
        async command() {
          // Install ory cli
          logger.info('Installing Ory Cli...');
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
          logger.info('Ory Cli install successfully. ' + result);
        })
        .catch((err) => {
          let errString = err.message;
          logger.error(err, 'installOryCli');
          if (errString.includes('-bash: brew: command not found')) {
            const installItem = {
              title: 'Install Brew',
              command() {
                runCommand(
                  '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
                )
                  .then((result) => {
                    logger.info('Brew install successfully. ' + result);
                    vscode.window.showInformationMessage('Brew was installed successfully!');
                    offerToInstallOry();
                  })
                  .catch((err) => {
                    logger.error(err, 'installOryCli');
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
          logger.info('Ory Cli install successfully');
        })
        .catch((err) => {
          logger.error(err, 'installOryCli');
          var errString = err.message;
          if (errString.includes('ory/ info installed ./ory')) {
            vscode.window.showInformationMessage('Ory Cli was installed successfully!');
            logger.info('Ory Cli was installed successfully!');
          }
        });
      break;
    case 'win32':
      await runCommand('scoop bucket add ory https://github.com/ory/scoop.git && scoop install ory')
        .then((result) => {
          alreadyOfferedToInstallOry = true;
          logger.info('Ory Cli install successfully. ' + result);
          let oryVersionMessage = result.split('\n');
          if (oryVersionMessage[oryVersionMessage.length - 1] === '') {
            vscode.window.showInformationMessage(oryVersionMessage[oryVersionMessage.length - 2]);
          } else {
            vscode.window.showInformationMessage('Ory Cli was installed successfully!');
          }
        })
        .catch((err) => {
          logger.error(err.message);
          var errString = err.message;
          if (errString.includes(`'scoop' is not recognized as an internal or external command`)) {
            const installItem = {
              title: 'Install Scoop',
              command() {
                runCommand(
                  'powershell -command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser; irm get.scoop.sh | iex"'
                )
                  .then((result) => {
                    logger.debug('Scoop install successfully. ' + result);
                    vscode.window.showInformationMessage('scoop was installed successfully!');
                    logger.info('scoop was installed successfully!');
                    offerToInstallOry();
                  })
                  .catch((err) => {
                    logger.error(err);
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
      logger.warn('Not able to recognize the OS!');
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
