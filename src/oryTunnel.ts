import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { oryCommand } from './extension';
import { spawnCommonErrAndClose } from './helper';
import { ListRunningProcessProvider, RunningProcess } from './tree/listTunnelProcess';

export async function runOryTunnel(listRunningProcesses: ListRunningProcessProvider) {
  const result = await vscode.window.showQuickPick(
    [
      {
        label: 'allowed-cors-origins',
        description:
          'A list of allowed CORS origins. Wildcards are allowed. For multiple application urls add it as comma (,) separated.'
      },
      {
        label: 'cookie-domain',
        description: `Set a dedicated cookie domain.`
      },
      {
        label: 'debug',
        description: 'Use this flag to debug, for example, CORS requests.'
      },
      {
        label: 'default-redirect-url',
        description: `Set the URL to redirect to per default after e.g. login or account creation.`
      },
      {
        label: 'dev',
        description: 'Use this flag when developing locally.'
      },
      {
        label: 'port',
        description: 'The port the proxy should listen on. (default 4000)'
      },
      {
        label: 'project',
        description: 'The slug of your Ory Network project.'
      },
      {
        label: 'None',
        description: 'None. skip these options.',
        picked: true
      }
    ],
    {
      placeHolder: 'Pick to options...',
      title: 'Ory Tunnel',
      ignoreFocusOut: true,
      canPickMany: true
    }
  );

  if (result === undefined) {
    return;
  }

  let name = await vscode.window.showInputBox({
    title: 'Name',
    placeHolder: 'Name',
    ignoreFocusOut: true
  });

  if (name === undefined) {
    vscode.window.showWarningMessage('Name is required');
    return;
  }

  let projectID = await vscode.window.showInputBox({
    title: 'Project ID',
    placeHolder: 'Project ID',
    ignoreFocusOut: true
  });

  if (projectID === undefined) {
    return;
  }

  const flagDataJson: { [key: string]: string } = {};

  const applicationURLs = await vscode.window.showInputBox({
    title: 'Application URLs',
    placeHolder: 'Application URLs',
    prompt: 'For multiple application urls add it as comma (,) separated',
    ignoreFocusOut: true
  });

  if (applicationURLs === undefined) {
    return;
  }

  flagDataJson['application-urls'] = applicationURLs.replace(/\s/g, '');

  for (const option of result) {
    if (option.label === 'None' || option.label === 'project') {
      continue;
    } else if (option.label === 'dev' || option.label === 'debug') {
      flagDataJson[option.label] = 'true';
    } else {
      console.log(option.label);
      await vscode.window
        .showInputBox({
          title: option.label,
          placeHolder: option.label,
          prompt: option.description,
          ignoreFocusOut: true
        })
        .then((val) => {
          if (val === undefined) {
            return;
          }
          flagDataJson[option.label] = val.replace(/\s/g, '');
        });
    }
  }

  let stringBuilder: string[] = [];
  for (const key in flagDataJson) {
    if (key === 'None') {
      continue;
    }
    if (key === 'dev' || key === 'debug') {
      stringBuilder.push(`--${key}`);
      continue;
    }

    if (key === 'application-urls') {
      for (const url of processCommaSeparatedToArray(flagDataJson[key])) {
        stringBuilder.push(`${url}`);
      }
      continue;
    }

    if (key === 'allowed-cors-origins') {
      for (const url of processCommaSeparatedToArray(flagDataJson[key])) {
        stringBuilder.push(`--${key}=${url}`);
      }
      continue;
    }
    stringBuilder.push(`--${key}=${flagDataJson[key]}`);
  }

  const tunnelToken = spawn(oryCommand, ['tunnel', `--project=${projectID}`, ...stringBuilder]);

  let pid: string;
  if (tunnelToken.pid === undefined) {
    pid = makeId(10);
  } else {
    pid = `${tunnelToken.pid}`;
  }
  const tunnelProcess: RunningProcess = {
    id: pid,
    command: 'tunnel',
    status: 'running',
    process: tunnelToken,
    processName: name
  };

  listRunningProcesses.add(tunnelProcess);
}

function processCommaSeparatedToArray(input: string | undefined): string[] {
  if (input === undefined) {
    return [];
  }
  return input.split(',');
}

function makeId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
