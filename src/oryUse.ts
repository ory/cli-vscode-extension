import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { outputChannel, oryCommand } from './extension';
import { runOryListProjects } from './tree/listProjects';
import { spwanCommonErrAndClose } from './helper';

export async function runOryUse() {
  let projectsList: { label: string; description: string }[] = [];
  await runOryListProjects().then((projectJson: any[]) => {
    projectJson.forEach((element: any) => {
      projectsList.push({ label: element.name, description: element.id });
    });
  });

  const result = await vscode.window.showQuickPick([...projectsList], {
    placeHolder: 'Pick project to be use',
    title: 'Ory Use'
  });

  if (result !== undefined) {
    runOryUseProject(result?.description, result?.label);
  } else {
    outputChannel.append('Use Project invalid option.');
  }
}

export async function runOryUseProject(projectId: string, projectName?: string) {
  const useProject = spawn(oryCommand, ['use', 'project', projectId]);

  await spwanCommonErrAndClose(useProject, 'useProject').then((value) => {
    if (value.includes('ID')) {
      vscode.window.showInformationMessage(`Using Project: ${projectName}`);
    }
  });
}
