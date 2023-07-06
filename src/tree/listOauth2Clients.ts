import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { oryCommand } from '../extension';
import { spwanCommonErrAndClose } from '../helper';

export interface Oauth2Clients {
  clientID: string;
  clientSecret: string;
  grantTypes: string[];
  responseType: string[];
  scope: string;
  audience: string[];
  redirectUris: string[];
  name: string;
}

export class ListOauth2ClientsProvider implements vscode.TreeDataProvider<Oauth2ClientsTreeItem> {
  private topLevelItems: Oauth2ClientsTreeItem[] = [];
  private _onDidChangeTreeData: vscode.EventEmitter<
    Oauth2ClientsTreeItem | Oauth2ClientsTreeItem[] | undefined | void
  > = new vscode.EventEmitter<Oauth2ClientsTreeItem | Oauth2ClientsTreeItem[] | undefined | void>();
  readonly onDidChangeTreeData?:
    | vscode.Event<void | Oauth2ClientsTreeItem | Oauth2ClientsTreeItem[] | null | undefined>
    | undefined = this._onDidChangeTreeData.event;

  constructor() {
    this.init();
  }

  async init() {
    const oauth2Clients = await runOryListOauth2Clients().catch((err) => {
      console.error(err);
      return [];
    });

    this.topLevelItems = oauth2Clients.items.map((oauth2: any) => {
      return new Oauth2ClientsTreeItem({
        name: oauth2.client_name,
        clientID: oauth2.client_id,
        clientSecret: oauth2.client_secret === undefined ? '' : oauth2.client_secret,
        audience: oauth2.audience,
        grantTypes: oauth2.grant_types,
        redirectUris: oauth2.redirect_uris,
        responseType: oauth2.response_types,
        scope: oauth2.scope
      });
    });
    this._onDidChangeTreeData.fire();
  }

  async refresh() {
    this.topLevelItems = [];
    this.init();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Oauth2ClientsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: Oauth2ClientsTreeItem | undefined): vscode.ProviderResult<Oauth2ClientsTreeItem[]> {
    if (element === undefined) {
      return this.topLevelItems;
    }
    return [];
  }
}

export class Oauth2ClientsTreeItem extends vscode.TreeItem {
  private readonly _item: Oauth2Clients;
  constructor(public readonly identity: Oauth2Clients) {
    super(identity.name !== '' ? identity.name : identity.clientID, vscode.TreeItemCollapsibleState.None);

    this.tooltip = `ClientID: ${identity.clientID}\nClientSecret: ${identity.clientSecret}\nGrant Types: ${identity.grantTypes}\nScope: ${identity.scope}\nAudience: ${identity.audience}\nRedirect URIS: ${identity.redirectUris}\nResponse Type: ${identity.responseType}`;
    this.iconPath = this.getIconPath(identity.clientID);
    this._item = this.identity;
  }

  private getIconPath(clientID: string): vscode.ThemeIcon | undefined {
    let icon: vscode.ThemeIcon;
    switch (clientID) {
      case '':
        icon = new vscode.ThemeIcon('repo');
        break;
      default:
        icon = new vscode.ThemeIcon('plug', new vscode.ThemeColor('debugIcon.startForeground'));
        break;
    }
    return icon;
  }

  public get clientID(): string {
    return this._item.clientID;
  }

  public get clientSecret(): string {
    return this._item.clientSecret;
  }
}

export async function runOryListOauth2Clients(): Promise<any> {
  let oauth2ClientsOutputFormat: string = 'json';
  let json: any;

  const listOauth2Clients = spawn(oryCommand, ['list', 'oauth2-clients', '--format', `${oauth2ClientsOutputFormat}`]);
  await spwanCommonErrAndClose(listOauth2Clients, 'Oauth2Clients').then((value) => {
    json = JSON.parse(value);
  });
  return json;
}
