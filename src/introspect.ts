import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { oryCommand } from './extension';
import { spawnCommonErrAndClose } from './helper';

export async function runOryIntrospect() {
  const result = await vscode.window.showQuickPick(
    [
      {
        label: 'scope',
        description: 'Additionally check if the scope was granted.'
      },
      {
        label: 'endpoint',
        description: `The URL of Ory Kratos' Admin API. Alternatively set using the KRATOS_ADMIN_URL environmental variable.`
      },
      {
        label: 'skip-tls-verify',
        description:
          'Do not verify TLS certificates. Useful when dealing with self-signed certificates. Do not use in production!'
      },
      {
        label: 'http-headers',
        description: `A list of additional HTTP headers to set. HTTP headers is separated by a : , for example: -H 'Authorization: bearer some-token'.`
      },
      {
        label: 'None',
        description: 'None. skip these options.',
        picked: true
      }
    ],
    {
      placeHolder: 'Pick to options...',
      title: 'Ory Introspect Token',
      ignoreFocusOut: true,
      canPickMany: true
    }
  );

  if (result === undefined) {
    return;
  }

  const flagDataJson: { [key: string]: string } = {};

  let projectID = await vscode.window.showInputBox({
    title: 'Project ID',
    placeHolder: 'Project ID',
    ignoreFocusOut: true
  });

  if (projectID === undefined) {
    return;
  }

  for (const option of result) {
    if (option.label === 'skip-tls-verify') {
      flagDataJson[option.label] = 'true';
    } else if (option.label === 'None') {
      continue;
    } else {
      console.log(option.label);
      await vscode.window
        .showInputBox({
          title: option.label,
          placeHolder: option.label,
          ignoreFocusOut: true
        })
        .then((val) => {
          if (val === undefined) {
            return;
          }
          flagDataJson[option.label] = val;
        });
    }
  }

  // token input
  const token = await vscode.window.showInputBox({
    title: 'Token',
    placeHolder: 'Token',
    ignoreFocusOut: true
  });

  if (token === undefined) {
    return;
  }

  let stringBuilder: string[] = [];
  for (const key in flagDataJson) {
    if (key === 'None') {
      continue;
    }
    if (key === 'skip-tls-verify') {
      stringBuilder.push(`--skip-tls-verify`);
    }
    stringBuilder.push(`--${key}=${flagDataJson[key]}`);
  }

  const introspectToken = spawn(oryCommand, ['introspect', 'token', token, `--project=${projectID}`, ...stringBuilder]);

  let val = await spawnCommonErrAndClose(introspectToken, 'introspect', '');

  let active = '';
  let processString = val.split('\n');
  let resultString = '';
  for (let i = 0; i < processString.length; i++) {
    processString[i] = processString[i].trim().replace('\t\t', ': ');
  }
  active = processString[0];
  for (let i = 0; i < processString.length; i++) {
    if (!processString[i].includes(':')) {
      resultString += processString[i] + ':NULL\n';
    } else {
      resultString += processString[i] + '\n';
    }
  }
  const detailBtn = {
    title: 'View Details',
    command() {
      vscode.window.showInformationMessage('Ory Introspect Token:', {
        modal: true,
        detail: `${resultString}`
      });
    }
  };
  console.log(active);
  vscode.window.showInformationMessage(`Ory Introspect Token: ${active}`, detailBtn).then((selection) => {
    if (selection) {
      selection.command();
    }
  });
  return;
}
