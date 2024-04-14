import * as vscode from 'vscode';
import * as os from 'os';
import * as pty from 'node-pty';
import stripAnsi from 'strip-ansi';
import { spawn } from 'child_process';
import { logger } from './helper/logger';

export async function runOryAuth() {
  const virtualEnter = os.platform() === 'win32' ? '\r' : '\n';

  const yNInput = await vscode.window.showInputBox({
    title: 'Do you want to sign in to an existing Ory Network account?',
    placeHolder: '[y/N]'
  });
  if (yNInput === undefined) {
    return;
  }
  switch (yNInput.toLowerCase()) {
    case 'y':
      const emailInput = await vscode.window.showInputBox({
        title: 'Email',
        placeHolder: 'email@here.com'
      });

      if (emailInput === undefined) {
        return;
      }

      const passwordInput = await vscode.window.showInputBox({
        placeHolder: 'Password',
        title: 'Password',
        password: true
      });
      if (passwordInput === undefined) {
        return;
      }
      oryAuthHelper(yNInput, emailInput, passwordInput, '', '', '', virtualEnter);
      break;

    case 'n':
      const emailRegisterInput = await vscode.window.showInputBox({
        title: 'Email',
        placeHolder: 'email@here.com'
      });

      if (emailRegisterInput === undefined) {
        return;
      }

      const passwordRegisterInput = await vscode.window.showInputBox({
        placeHolder: 'Password',
        title: 'Password',
        password: true
      });
      if (passwordRegisterInput === undefined) {
        return;
      }

      const nameRegisterInput = await vscode.window.showInputBox({
        title: 'Name',
        placeHolder: 'Name'
      });

      if (nameRegisterInput === undefined) {
        return;
      }

      const securityUpdatesInput = await vscode.window.showInputBox({
        title: 'Please inform me about platform and security updates:',
        placeHolder: '[y/n]'
      });

      if (securityUpdatesInput === undefined) {
        return;
      }

      const termsOfServiceInput = await vscode.window.showInputBox({
        title: 'I accept the Terms of Service https://www.ory.sh/ptos:',
        placeHolder: '[y/n]'
      });

      if (termsOfServiceInput === undefined) {
        return;
      }

      oryAuthHelper(
        yNInput,
        emailRegisterInput,
        passwordRegisterInput,
        nameRegisterInput,
        securityUpdatesInput,
        termsOfServiceInput,
        virtualEnter
      );
      break;

    default:
      break;
  }
}

function oryAuthHelper(
  yNInput: string,
  emailInput: string,
  passwordInput: string,
  name: string,
  securityUpdatesInput: string,
  termsOfServiceInput: string,
  virtualEnter: string
) {
  var ptyProcess = pty.spawn(os.platform() === 'win32' ? 'ory.exe' : 'ory', ['auth'], { name: 'ory' });
  ptyProcess.write(yNInput + virtualEnter);
  ptyProcess.write(emailInput + virtualEnter);
  ptyProcess.write(passwordInput + virtualEnter);

  if (yNInput === 'n') {
    ptyProcess.write(name + virtualEnter);
    ptyProcess.write(securityUpdatesInput + virtualEnter);
    ptyProcess.write(termsOfServiceInput + virtualEnter);
  }

  ptyProcess.onData(async (data: any) => {
    data = stripAnsi(data);
    if (!data.includes(passwordInput)) {
      logger.debug(data);
    }
    logger.debug(data);
    // If Totp's setup authentication code input box is prompted
    if (data.includes('Authentication code')) {
      const totpInput = await vscode.window.showInputBox({
        placeHolder: 'Authentication code',
        title: 'Please complete the second authentication challenge.'
      });
      if (totpInput === undefined) {
        return;
      }
      ptyProcess.write(totpInput + virtualEnter);
    }

    // Signed in successfully
    if (data.includes('You are now signed in as: ' + emailInput)) {
      logger.info('You are now signed in as: ' + emailInput + '🎉');
      vscode.window.showInformationMessage('You are now signed in as: ' + emailInput + '🎉');
    }

    // Wrong credentials or any failed sign attempt
    if (data.includes('Your sign in attempt failed')) {
      const retryLogin = {
        title: 'Retry',
        command() {
          vscode.commands.executeCommand('ory.auth');
        }
      };
      vscode.window
        .showErrorMessage(
          'Your sign in attempt failed. Please try again!The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number.',
          retryLogin
        )
        .then((selection) => {
          if (selection) {
            selection.command();
          }
        });
      logger.error(
        'Your sign in attempt failed. Please try again! The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number.'
      );
      os.platform() === 'win32' ? ptyProcess.kill() : ptyProcess.kill('1');
    }

    // Registration failed, or any registration errors
    if (data.includes('Your account creation attempt failed')) {
      let extractErrMsg = data.split('\n')[1];
      extractErrMsg = extractErrMsg.replace(os.platform() === 'win32' ? '\r' : '\n', '');
      logger.error('error ' + extractErrMsg);

      const retryRegistration = {
        title: 'Retry',
        command() {
          vscode.commands.executeCommand('ory.auth');
        }
      };
      vscode.window.showErrorMessage(extractErrMsg, retryRegistration).then((selection) => {
        if (selection) {
          selection.command();
        }
      });
    }

    // Account already exists
    if (data.includes('An account with the same identifier (email, phone, username, ...) exists already')) {
      logger.info('account already exists!');
    }
  });

  // Any Errors
  ptyProcess.onExit((e: any) => {
    logger.error(e);
  });
}

// Ory Logout Command
export async function runOryAuthLogout() {
  const ls = spawn(os.platform() === 'win32' ? 'ory.exe' : 'ory', ['auth', 'logout']);

  ls.stdout.on('data', (data) => {
    logger.debug(`stdout: ${data}`);
    console.log(`stdout: ${data}`);
    vscode.window.showInformationMessage('You signed out successfully ☹️');
    logger.info('You signed out successfully ☹️');
  });

  ls.stderr.on('data', (data) => {
    logger.debug(String(data));
    console.error(`stderr: ${data}`);
    logger.error(`stderr: ${data}`);
  });

  ls.on('close', (code) => {
    logger.debug(`\nprocess exited with code ${code}`);
    console.log(`child process exited with code ${code}`);
  });
}
