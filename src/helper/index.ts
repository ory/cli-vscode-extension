import * as vscode from 'vscode';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { outputChannel } from '../extension';

export async function spawnCommonErrAndClose(
  spawnObj: ChildProcessWithoutNullStreams,
  componentName: string,
  format?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    let cmdOutput: string = '';
    spawnObj.stdout.on('data', (data) => {
      outputChannel.append('\n' + String(data));
      console.log(`stdout: ${data}`);
      if (format !== '' && format !== undefined) {
        let jsonOrYamlExt: string = format?.includes('json') ? 'json' : 'yaml';
        webViewPanel(componentName + 'Panel', componentName + '-' + jsonOrYamlExt, vscode.ViewColumn.Beside, data);
      }
      cmdOutput += String(data);
    });

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
      if (data.includes('Error: no project was specified')) {
        vscode.window.showErrorMessage('No project id was specified');
      } else {
        vscode.window.showErrorMessage('Oops 🫢 something went wrong! Please check in Output -> Ory');
      }
    });

    spawnObj.on('close', (code) => {
      outputChannel.append(`\nprocess exited with code ${code}`);
      console.log(`child process exited with code ${code}`);
      resolve(cmdOutput.trim());
    });
  });
}

export async function format(cmd: string): Promise<string> {
  const formatInput = await vscode.window.showQuickPick(
    [{ label: 'json', picked: true }, { label: 'yaml' }, { label: 'json-pretty' }],
    { title: `${cmd} format`, placeHolder: 'Set the output format', ignoreFocusOut: true }
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

export function webViewPanel(viewType: string, title: string, showOptions: vscode.ViewColumn, output: any) {
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

export async function commandInput(obj: {
  label: string;
  description: string;
  type: string;
  useLabelPlaceHolder?: boolean;
}): Promise<string[]> {
  let resultString: string[] = [];
  let input: string | undefined;
  if (obj.type === 'empty') {
    input = '';
  } else {
    let placeHolder = obj.useLabelPlaceHolder ? obj.label : 'Project ID';
    input = await vscode.window.showInputBox({
      title: obj.label,
      placeHolder:
        obj.type === 'string' ? `Enter ${placeHolder}` : 'Enter multiple inputs "," (comma-separated). ex- id-1, id-2',
      prompt: obj.description,
      ignoreFocusOut: true
    });
  }

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

export async function fileType(cmd: string): Promise<string> {
  const formatInput = await vscode.window.showQuickPick(
    [{ label: 'json', picked: true }, { label: 'yaml/yml' }, { label: 'url' }, { label: 'base64' }],
    { title: `${cmd} format`, placeHolder: 'Set the output format', ignoreFocusOut: true }
  );
  if (formatInput === undefined) {
    return 'noUploadTypeSelected';
  }
  switch (formatInput?.label) {
    case 'yaml/yml':
      return 'yaml';
    case 'url':
      return 'url';
    case 'base64':
      return 'base64';
    default:
      return 'json';
  }
}
