import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { oryCommand } from '../extension';
import { spwanCommonErrAndClose } from '../helper';

interface TreeOutputPermission {
  subject: string;
  relation: string;
  object: string;
}

export class ListRelationshipsProvider implements vscode.TreeDataProvider<RelationshipsTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    RelationshipsTreeItem | RelationshipsTreeItem[] | undefined | void
  > = new vscode.EventEmitter<RelationshipsTreeItem | RelationshipsTreeItem[] | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<RelationshipsTreeItem | RelationshipsTreeItem[] | undefined | void> =
    this._onDidChangeTreeData.event;

  private subjects: Record<string, Record<string, string[]>> = {};

  constructor() {
    this.init();
  }

  async init() {
    const relationships = await runOryListRelationships().catch((err) => {
      console.error(err);
      return [];
    });

    const treeViewDataObj = this.buildRelationshipsJSON(relationships.relation_tuples);
    this.subjects = treeViewDataObj;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RelationshipsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: RelationshipsTreeItem | undefined): vscode.ProviderResult<RelationshipsTreeItem[]> {
    if (element === undefined) {
      const topLevelItems: RelationshipsTreeItem[] = [];
      for (const subject in this.subjects) {
        const relationships: Record<string, string[]> = this.subjects[subject];
        const topLevelItem = new RelationshipsTreeItem(
          subject,
          relationships,
          vscode.TreeItemCollapsibleState.Expanded,
          '',
          new vscode.ThemeColor('debugIcon.pauseForeground')
        );
        topLevelItems.push(topLevelItem);
      }
      return topLevelItems;
    }
    return element.getChildren();
  }

  refresh(): void {
    this.subjects = {};
    this.init();
    this._onDidChangeTreeData.fire();
  }

  private buildRelationshipsJSON(respJson: any): Record<string, Record<string, string[]>> {
    const topLevelList: TreeOutputPermission[] = [];
    // Builds the relationship strings
    respJson.forEach(function (value: any) {
      let subjectBuild: string = '';

      if (value.subject_id === undefined && value.subject_set !== undefined) {
        if (value.subject_set.relation !== '' && value.subject_set.relation !== undefined) {
          subjectBuild =
            value.subject_set.namespace + ':' + value.subject_set.object + '#' + value.subject_set.relation;
        } else {
          subjectBuild = value.subject_set.namespace + ':' + value.subject_set.object;
        }
      } else if (value.subject_id !== undefined && value.subject_set === undefined) {
        subjectBuild = value.subject_id;
      }
      var output: TreeOutputPermission = {
        subject: subjectBuild,
        object: value.namespace + ':' + value.object,
        relation: value.relation
      };
      topLevelList.push(output);
    });

    // Build group of object for tree view based on relationship
    const relationshipsMap: Map<string, Map<string, string[]>> = new Map();

    for (const item of topLevelList) {
      const { subject, object, relation } = item;
      if (relationshipsMap.has(subject)) {
        const subjectMap = relationshipsMap.get(subject)!;
        if (subjectMap.has(relation)) {
          const exisitingObjects = subjectMap.get(relation)!;
          exisitingObjects.push(object);
        } else {
          subjectMap.set(relation, [object]);
        }
      } else {
        const subjectMap: Map<string, string[]> = new Map([[relation, [object]]]);
        relationshipsMap.set(subject, subjectMap);
      }
    }
    // convert Map to Object
    const obj: Record<string, Record<string, string[]>> = Object.fromEntries(
      Array.from(relationshipsMap.entries()).map(([subject, subjectMap]) => {
        const innerObject = Object.fromEntries(subjectMap);
        return [subject, innerObject];
      })
    );
    return obj;
  }
}

class RelationshipsTreeItem extends vscode.TreeItem {
  public children: RelationshipsTreeItem[];
  constructor(
    public readonly subject: string,
    public readonly relationships: Record<string, string[]>,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly tooltip?: string,
    public readonly color?: vscode.ThemeColor
  ) {
    super(subject, collapsibleState);

    this.tooltip = tooltip ? tooltip : subject;
    this.iconPath = new vscode.ThemeIcon('references', color);
    this.children = [];
  }

  getChildren(): RelationshipsTreeItem[] {
    for (const relationship in this.relationships) {
      const child = new RelationshipsTreeItem(
        relationship,
        {},
        relationship === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded,
        '',
        new vscode.ThemeColor('debugIcon.disconnectForeground')
      );
      if (relationship) {
        for (const childObject of this.relationships[relationship]) {
          const objectChild = new RelationshipsTreeItem(
            childObject,
            {},
            vscode.TreeItemCollapsibleState.None,
            `${this.subject} is ${relationship} of ${childObject}`,
            new vscode.ThemeColor('debugIcon.startForeground')
          );
          child.children.push(objectChild);
        }
      }
      this.children.push(child);
    }
    return this.children;
  }
}

export async function runOryListRelationships(): Promise<any> {
  let relationshipOutputFormat: string = 'json';
  let json: any;

  const listRelationships = spawn(oryCommand, ['list', 'relationships', '--format', `${relationshipOutputFormat}`]);
  await spwanCommonErrAndClose(listRelationships, 'Relationships').then((value) => {
    json = JSON.parse(value);
  });
  return json;
}
