// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { exec } from "child_process";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ory" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposableHelloWorld = vscode.commands.registerCommand(
    "ory.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      vscode.window.showInformationMessage("Hello World from ory!");
    }
  );
  let disposableOryVersion = vscode.commands.registerCommand(
    "ory.version",
    () => {
      runOryVersion();
    }
  );
  context.subscriptions.push(disposableHelloWorld, disposableOryVersion);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function runOryVersion() {
  exec("ory version", (error: Error | null, stdout: string, stderr: string) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    vscode.window.showInformationMessage(`${stdout}`, {
      modal: true,
    });
  });
}
