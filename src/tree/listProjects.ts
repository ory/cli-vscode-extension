import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { oryCommand } from '../extension';
import { spwanCommonErrAndClose } from '../helper';

export interface Project {
  id: string;
  slug: string;
  state: string;
  name: string;
}

export class ListProjectsProvider implements vscode.TreeDataProvider<ProjectsTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ProjectsTreeItem | ProjectsTreeItem[] | undefined | void> =
    new vscode.EventEmitter<ProjectsTreeItem | ProjectsTreeItem[] | undefined | void>();
  readonly onDidChangeTreeData?:
    | vscode.Event<void | ProjectsTreeItem | ProjectsTreeItem[] | null | undefined>
    | undefined = this._onDidChangeTreeData.event;

  private topLevelItems: ProjectsTreeItem[] = [];

  constructor() {
    this.init();
  }

  async init() {
    const projects = await runOryListProjects().catch((err) => {
      console.error(err);
      return [];
    });

    this.topLevelItems = projects.map((project: Project) => {
      return new ProjectsTreeItem({
        id: project.id,
        slug: project.slug,
        state: project.state,
        name: project.name
      });
    });
    this._onDidChangeTreeData.fire();
  }

  async refresh() {
    this.topLevelItems = [];
    this.init();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ProjectsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: ProjectsTreeItem | undefined): vscode.ProviderResult<ProjectsTreeItem[]> {
    if (element === undefined) {
      return this.topLevelItems;
    }
    return [];
  }
}

export class ProjectsTreeItem extends vscode.TreeItem {
  private readonly _item: Project;
  constructor(public readonly project: Project) {
    super(project.name, vscode.TreeItemCollapsibleState.None);

    this.tooltip = `ID: ${project.id}\nSlug: ${project.slug}\nState: ${project.state}`;
    this.iconPath = this.getIconPath(project.state);
    this._item = this.project;
  }

  public get pId(): string {
    return this._item.id;
  }

  public get pSlug(): string {
    return this._item.slug;
  }

  public get pState(): string {
    return this._item.state;
  }

  public get pName(): string {
    return this._item.name;
  }

  private getIconPath(state: string): vscode.ThemeIcon | undefined {
    let icon: vscode.ThemeIcon;
    switch (state) {
      case 'running' || 'Running':
        icon = new vscode.ThemeIcon('debug-start', new vscode.ThemeColor('debugIcon.startForeground'));
        break;
      case 'halted' || 'Halted':
        icon = new vscode.ThemeIcon('debug-stop', new vscode.ThemeColor('debugIcon.stopForeground'));
        break;
      case 'deleted' || 'Deleted':
        icon = new vscode.ThemeIcon('trash', new vscode.ThemeColor('debugIcon.disconnectForeground'));
        break;
      default:
        icon = new vscode.ThemeIcon('repo');
        break;
    }
    return icon;
  }
}

export async function runOryListProjects(): Promise<any> {
  let projectOutputFormat: string = 'json';
  let json: any;

  const listProject = spawn(oryCommand, ['list', 'projects', '--format', `${projectOutputFormat}`]);
  await spwanCommonErrAndClose(listProject, 'Projects').then((value) => {
    json = JSON.parse(value);
  });
  return json;
}
