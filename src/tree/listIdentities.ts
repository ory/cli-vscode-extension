import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { oryCommand } from '../extension';
import { spwanCommonErrAndClose } from '../helper';

export interface Identity {
  id: string;
  state: string;
  traits: string;
  schemaId: string;
  schemaUrl: string;
}

export class ListIdentitiesProvider implements vscode.TreeDataProvider<IdentitiesTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<IdentitiesTreeItem | IdentitiesTreeItem[] | undefined | void> =
    new vscode.EventEmitter<IdentitiesTreeItem | IdentitiesTreeItem[] | undefined | void>();
  readonly onDidChangeTreeData?:
    | vscode.Event<void | IdentitiesTreeItem | IdentitiesTreeItem[] | null | undefined>
    | undefined = this._onDidChangeTreeData.event;

  private topLevelItems: IdentitiesTreeItem[] = [];

  constructor() {
    this.init();
  }

  async init() {
    const identities = await runOryListIdentities().catch((err) => {
      console.error(err);
      return [];
    });

    this.topLevelItems = identities.map((identity: any) => {
      const traitsKeys = Object.keys(identity.traits);
      const traitValue = identity.traits[traitsKeys[0]];
      return new IdentitiesTreeItem({
        id: identity.id,
        state: identity.state,
        schemaId: identity.schema_id,
        schemaUrl: identity.schema_url,
        traits: traitValue
      });
    });
    this._onDidChangeTreeData.fire();
  }

  async refresh() {
    this.topLevelItems = [];
    this.init();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: IdentitiesTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: IdentitiesTreeItem | undefined): vscode.ProviderResult<IdentitiesTreeItem[]> {
    if (element === undefined) {
      return this.topLevelItems;
    }
    return [];
  }
}

export class IdentitiesTreeItem extends vscode.TreeItem {
  private readonly _item: Identity;
  constructor(public readonly identity: Identity) {
    super(identity.traits, vscode.TreeItemCollapsibleState.None);

    this.tooltip = `ID: ${identity.id}\nState: ${identity.state}\nTraits: ${identity.traits}\nSchema ID: ${identity.schemaId}\nSchema URL: ${identity.schemaUrl}`;
    this.iconPath = this.getIconPath(identity.state);
    this._item = this.identity;
  }

  public get iId(): string {
    return this._item.id;
  }

  public get iSchemaID(): string {
    return this._item.schemaId;
  }

  public get iSchemaUrl(): string {
    return this._item.schemaUrl;
  }

  public get iState(): string {
    return this._item.state;
  }

  public get iTraits(): string {
    return this._item.traits;
  }

  private getIconPath(state: string): vscode.ThemeIcon | undefined {
    let icon: vscode.ThemeIcon;
    switch (state) {
      case 'active':
        icon = new vscode.ThemeIcon('account', new vscode.ThemeColor('debugIcon.startForeground'));
        break;
      case 'inactive':
        icon = new vscode.ThemeIcon('error', new vscode.ThemeColor('debugIcon.stopForeground'));
        break;
      default:
        icon = new vscode.ThemeIcon('repo');
        break;
    }
    return icon;
  }
}

export async function runOryListIdentities(): Promise<any> {
  let identitiesOutputFormat: string = 'json';
  let json: any;

  const listIdentities = spawn(oryCommand, ['list', 'identities', '--format', `${identitiesOutputFormat}`]);
  await spwanCommonErrAndClose(listIdentities, 'Identities').then((value) => {
    json = JSON.parse(value);
  });
  return json;
}
