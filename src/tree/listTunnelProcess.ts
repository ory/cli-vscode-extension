import * as vscode from 'vscode';
import { ChildProcessWithoutNullStreams } from 'child_process';

// Define a data structure for a running process
export interface RunningProcess {
  id: string;
  command: string;
  status: 'running' | 'paused' | 'stopped';
  process: ChildProcessWithoutNullStreams;
  processName: string;
}

// Provider class for the tree view
export class ListRunningProcessProvider implements vscode.TreeDataProvider<RunningProcessTreeItem> {
  private topLevelItems: RunningProcessTreeItem[] = [];
  private _onDidChangeTreeData: vscode.EventEmitter<
    RunningProcessTreeItem | RunningProcessTreeItem[] | undefined | void
  > = new vscode.EventEmitter<RunningProcessTreeItem | RunningProcessTreeItem[] | undefined | void>();
  readonly onDidChangeTreeData?: vscode.Event<
    RunningProcessTreeItem | RunningProcessTreeItem[] | undefined | void | null
  > = this._onDidChangeTreeData.event;

  getTreeItem(element: RunningProcessTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: RunningProcessTreeItem): vscode.ProviderResult<RunningProcessTreeItem[]> {
    if (!element) {
      return this.topLevelItems;
    }
    return [];
  }

  // Add methods to start and kill processes
  add(process: RunningProcess) {
    this.topLevelItems.push(new RunningProcessTreeItem(process));
    this._onDidChangeTreeData.fire();
  }

  remove(id: string) {
    const index = this.topLevelItems.findIndex((item) => item.runningPS.id === id);
    if (index !== -1) {
      this.topLevelItems[index].runningPS.process.kill();
      this.topLevelItems.splice(index, 1);
      this._onDidChangeTreeData.fire();
    }
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}

export class RunningProcessTreeItem extends vscode.TreeItem {
  private _item: RunningProcess;
  constructor(public readonly runningPS: RunningProcess) {
    super(runningPS.processName, vscode.TreeItemCollapsibleState.None);

    this.tooltip = `Process: ${runningPS.id}\nApplication: ${runningPS.processName}`;
    this.iconPath = this.getIconPath(runningPS.status);
    this._item = runningPS;
    this.contextValue = 'runningProcess';
  }

  private getIconPath(status: string): vscode.ThemeIcon | undefined {
    let icon: vscode.ThemeIcon;
    switch (status) {
      case 'paused':
        icon = new vscode.ThemeIcon('debug-pause', new vscode.ThemeColor('debugIcon.pauseForeground'));
        break;
      case 'stopped':
        icon = new vscode.ThemeIcon('debug-stop', new vscode.ThemeColor('debugIcon.stopForeground'));
        break;
      default:
        icon = new vscode.ThemeIcon('debug-disconnect', new vscode.ThemeColor('debugIcon.startForeground'));
        break;
    }
    return icon;
  }
}
