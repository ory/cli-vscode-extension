# ory README

This is the README for your extension "ory". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Known Issues

### Node-pty Issue

Please check the dependency of [Node-Pty](https://github.com/microsoft/node-pty#dependencies) if you're getting any errors regarding node-pty after or while performing `npm install`.

#### Linux Solution

On Linux, if you're on the latest version of NodeJS and still getting errors from Node-Pty, try NodeJs v16 (you can use [nvm](https://github.com/nvm-sh/nvm)) it may resolve your problem. or you can build a package (node-pty) for your NodeJs version using this command.

```
./node_modules/.bin/electron-rebuild -f -w node-pty --version <electron-version>
```

`<electron-version>` can be `--version 22.3.10` (if it works good) or whatever version your VSCode is using below one. (Vscode > help > about > Electron version)

#### Windows Solution

On Windows, you will have to first install all the dependencies for [node-pty](https://github.com/microsoft/node-pty#windows).

It is similar to Linux; here we have to build the package again after `npm install`.

```
node_modules\.bin\electron-rebuild.cmd -f -w node-pty --version <electron-version>
```

`<electron-version>` can be `--version 22.3.10` (if it works good) or whatever version your VSCode is using below one. (Vscode > help > about > Electron version)

In some cases, you will see `node-pty\Debug\conpty...` not found. You will have to add the `--debug` flag to the above command. It will create a debug folder and remove the release folder. The best way is to make a copy of the `Release` folder and rename it to `Debug` so it will work in both cases.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
