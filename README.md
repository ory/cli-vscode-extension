# Ory CLI VSCode Extension

This extension enables Visual Studio Code to use the [Ory CLI](https://github.com/ory/cli) to interact with your Ory Network projects and services.

## Features

All features revolve around managing your projects and services directly from your Visual Studio Code workspace:

- Project Management: Easily create, update, and delete Ory projects.
- Service Interaction: Interact with your Ory services using the integrated terminal.
- Contextual Menus: Right-click context menus for quick access to common tasks.
- Integrated Debugging: Debug your Ory applications directly within Visual Studio Code.

## Requirements

This extension requires Visual Studio Code `version 1.77.0` or higher. You also need to have the Ory CLI installed on your system running `version 0.3.4` or higher.

## Usage

After installing the extension, you can access its features from the Command Palette (Ctrl+Shift+P). Just type "Ory" to see a list of available commands that you can then access directly.

## Extension Settings
This extension contributes the following settings:

- `ory.activate`: Activates the Ory extension 
- `ory.projects.refresh`: Refreshes the list of Ory projects 
- `ory.projects.patchConfig`: Patches the configuration of an Ory project 
- `ory.import.jwk`: Imports a JSON Web Key (JWK) into an Ory project 
- `ory.identities.refresh`: Refreshes the list of identities in an Ory project


## Known Issues

Please refer to the [Issues](https://github.com/ory/cli-vscode-extension/issues) section for a list of known issues and their solutions.

## Contributing

We welcome contributions from the community. If you'd like to contribute, please open a pull-request.
