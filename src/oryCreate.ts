import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { outputChannel } from './extension';
import * as os from 'os';

const oryCommand: string = os.platform() === 'win32' ? 'ory.exe' : 'ory';

export async function runOryCreate() {
  const result = await vscode.window.showQuickPick(
    [
      { label: 'jwk', description: 'Create a JSON Web Key Set with a JSON Web Key' },
      { label: 'oauth2-client', description: 'Create an OAuth 2.0 Client' },
      { label: 'project', description: 'Create a new Ory Network project' },
      { label: 'relationships', description: 'Create relation tuples from JSON files' }
    ],
    { placeHolder: 'Pick to create...', title: 'Ory Create', ignoreFocusOut: true }
  );

  switch (result?.label) {
    case 'jwk':
      console.log(`Got: jwk`);
      const jwkSetInput = await vscode.window.showInputBox({
        title: 'JWK Set ID',
        placeHolder: '<my-jwk-set>',
        ignoreFocusOut: true
      });

      if (jwkSetInput === undefined) {
        vscode.window.showErrorMessage(`Invalid jwk set id ${jwkSetInput}`);
        return;
      }

      const algorithm = await vscode.window.showQuickPick(
        [
          { label: 'RS256', picked: true },
          { label: 'RS512' },
          { label: 'ES256' },
          { label: 'ES512' },
          { label: 'EdDSA' }
        ],
        { placeHolder: 'Select the algorithm to generate the key. (default "RS256")', title: 'JWK Algorithm' }
      );

      const intendedUse = await vscode.window.showQuickPick([{ label: 'sig', picked: true }, { label: 'enc' }], {
        placeHolder: 'Select intended use of this key. (default "sig")',
        title: 'Use'
      });
      const createJWK = spawn(oryCommand, [
        'create',
        'jwk',
        `${jwkSetInput}`,
        '--alg',
        `${algorithm?.label}`,
        '--use',
        `${intendedUse?.label}`
      ]);

      createJWK.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        if (data.includes(`SET ID\tKEY ID`) || data.includes(`${jwkSetInput}`)) {
          const viewDetails = {
            title: 'View Details',
            details() {
              let processString = String(data).split('\n');
              let resultString = '';

              let headings = processString[0].split('\t').filter((element) => {
                return element !== '';
              });
              let values = processString[1].split('\t').filter((element) => {
                return element !== '';
              });

              for (let i = 0; i < headings.length; i++) {
                resultString += headings[i] + ': ' + values[i] + '\n';
              }
              vscode.window.showInformationMessage('Created JWK', {
                modal: true,
                detail: `${resultString}`
              });
            }
          };
          vscode.window.showInformationMessage(`JWK created successfully!`, viewDetails).then((selection) => {
            if (selection) {
              selection.details();
            }
          });
        }
      });

      createJWK.stderr.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.error(`stderr: ${data}`);
        if (data.includes('Your session has expired or has otherwise become invalid')) {
          const reAuthenticate = {
            title: 'Re-authenticate',
            command() {
              vscode.commands.executeCommand('ory.auth');
            }
          };
          vscode.window.showErrorMessage(`${data}`, reAuthenticate).then((selection) => {
            if (selection) {
              selection.command();
            }
          });
          createJWK.kill();
        }
      });

      createJWK.on('close', (code) => {
        outputChannel.append(`\nprocess exited with code ${code}`);
        console.log(`child process exited with code ${code}`);
      });
      break;
    case 'oauth2-client':
      console.log(`Got: oauth2-client`);

      let oauth2ClientOptions: string[] = [];
      await oauth2Client().then((value) => {
        if (value.length === 0) {
          vscode.window.showInformationMessage('creating oauth2-client with default values.');
          console.log('creating oauth2-client with default values.');
        }
        oauth2ClientOptions = value;
      });
      console.log('This oauth2client: ' + oauth2ClientOptions);
      const createOauth2Client = spawn(oryCommand, ['create', 'oauth2-client', ...oauth2ClientOptions]);

      createOauth2Client.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        if (data.includes(`CLIENT ID`)) {
          const viewDetails = {
            title: 'View Details',
            details() {
              let processString = String(data).split('\n');
              processString.map((element, index) => {
                processString[index] = element.replace('\t', ': ');
              });
              let copyToclipboard = {
                title: 'Copy All',
                copy() {
                  vscode.env.clipboard.writeText(processString.join('\n'));
                }
              };
              let clientIdSecret: string = processString[0] + '\n' + processString[1];
              let copyClientIDSecret = {
                title: 'Copy ID & Secret',
                copy() {
                  vscode.env.clipboard.writeText(clientIdSecret.trimEnd());
                }
              };
              vscode.window
                .showInformationMessage(
                  'Created oauth2-client',
                  {
                    modal: true,
                    detail: `${processString.join('\n')}`
                  },
                  copyToclipboard,
                  copyClientIDSecret
                )
                .then((selection) => {
                  if (selection) {
                    selection.copy();
                  }
                });
            }
          };

          vscode.window.showInformationMessage(`Oauth2-client created successfully!`, viewDetails).then((selection) => {
            if (selection) {
              selection.details();
            }
          });
        }
      });

      createOauth2Client.stderr.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.error(`stderr: ${data}`);
        if (data.includes('Your session has expired or has otherwise become invalid')) {
          const reAuthenticate = {
            title: 'Re-authenticate',
            command() {
              vscode.commands.executeCommand('ory.auth');
            }
          };
          vscode.window.showErrorMessage(`${data}`, reAuthenticate).then((selection) => {
            if (selection) {
              selection.command();
            }
          });
          createOauth2Client.kill();
        } else {
          vscode.window.showErrorMessage('Opps 🫢 something went wrong! Please check in Output -> Ory');
        }
      });

      createOauth2Client.on('close', (code) => {
        outputChannel.append(`\nprocess exited with code ${code}`);
        console.log(`child process exited with code ${code}`);
      });
      break;
    case 'project':
      console.log('Got: project');
      const projectNameInput = await vscode.window.showInputBox({
        title: 'Project Name',
        placeHolder: 'Enter ory project name',
        ignoreFocusOut: true
      });

      if (projectNameInput === undefined) {
        vscode.window.showErrorMessage(`Invalid project name ${projectNameInput}`);
        return;
      }

      const createProject = spawn(oryCommand, ['create', 'project', '--name', `${projectNameInput}`]);

      createProject.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        if (data.includes(`NAME\t${projectNameInput}`)) {
          const viewDetails = {
            title: 'View Details',
            details() {
              let processString = String(data).split('\n');
              processString.map((element, index) => {
                processString[index] = element.replace('\t', ': ');
              });
              vscode.window.showInformationMessage('Project Information', {
                modal: true,
                detail: `${processString.join('\n')}`
              });
            }
          };
          vscode.window.showInformationMessage(`Project created successfully!`, viewDetails).then((selection) => {
            if (selection) {
              selection.details();
            }
          });
        }
      });

      createProject.stderr.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.error(`stderr: ${data}`);
        if (data.includes('Your session has expired or has otherwise become invalid')) {
          const reAuthenticate = {
            title: 'Re-authenticate',
            command() {
              vscode.commands.executeCommand('ory.auth');
            }
          };
          vscode.window.showErrorMessage(`${data}`, reAuthenticate).then((selection) => {
            if (selection) {
              selection.command();
            }
          });
          createProject.kill();
        }
      });

      createProject.on('close', (code) => {
        outputChannel.append(`\nprocess exited with code ${code}`);
        console.log(`child process exited with code ${code}`);
      });

      break;
    // TODO: Implementation of ory create relationships command is pending for vscode
    case 'relationships':
      console.log(`Got: relationships`);
      const relationshipConfigFileInput = await vscode.window.showOpenDialog({
        title: 'Ory Create Relationships',
        canSelectMany: false,
        filters: { "json": ['json']}
      });

      if (relationshipConfigFileInput === undefined) {
        vscode.window.showErrorMessage(`Invalid project name ${relationshipConfigFileInput}`);
        return;
      }
      console.log(relationshipConfigFileInput[0].fsPath);
      const createRelationships = spawn(oryCommand, ['create', 'relationships', `${relationshipConfigFileInput[0].fsPath}`]);

      createRelationships.stdout.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.log(`stdout: ${data}`);
        if (data.includes(`NAMESPACE`)) {
          vscode.window.showInformationMessage(`Relationship created successfully!`);
        }
      });

      createRelationships.stderr.on('data', (data) => {
        outputChannel.append('\n' + String(data));
        console.error(`stderr: ${data}`);
        if (data.includes('Your session has expired or has otherwise become invalid')) {
          const reAuthenticate = {
            title: 'Re-authenticate',
            command() {
              vscode.commands.executeCommand('ory.auth');
            }
          };
          vscode.window.showErrorMessage(`${data}`, reAuthenticate).then((selection) => {
            if (selection) {
              selection.command();
            }
          });
          createRelationships.kill();
        }
        vscode.window.showErrorMessage('Oops something went wrong!');
      });

      createRelationships.on('close', (code) => {
        outputChannel.append(`\nprocess exited with code ${code}`);
        console.log(`child process exited with code ${code}`);
      });
      break;
    default:
      break;
  }
}

async function oauth2Client(): Promise<string[]> {
  const flags = [
    {
      label: 'allowed-cors-origin',
      description: 'The list of URLs allowed to make CORS requests. Requires CORS_ENABLED',
      type: 'strings'
    },
    { label: 'audience', description: 'The audience this client is allowed to request.', type: 'strings' },
    {
      label: 'backchannel-logout-callback',
      description: 'Client URL that will cause the client to log itself out when sent a Logout Token by Hydra.',
      type: 'string'
    },
    {
      label: 'backchannel-logout-session-required',
      description:
        'Boolean flag specifying whether the client requires that a sid (session ID) Claim be included in the Logout Token to identify the client session with the OP when the backchannel-logout-callback is used. If omitted, the default value is false.',
      type: 'boolean'
    },
    {
      label: 'client-uri',
      description: 'A URL string of a web page providing information about the client.',
      type: 'string'
    },
    {
      label: 'contact',
      description: 'A list representing ways to contact people responsible for this client, typically email addresses.',
      type: 'string'
    },
    {
      label: 'frontchannel-logout-callback',
      description: 'Client URL that will cause the client to log itself out when rendered in an iframe by Hydra.',
      type: 'string'
    },
    {
      label: 'frontchannel-logout-session-required',
      description:
        'Boolean flag specifying whether the client requires that a sid (session ID) Claim be included in the Logout Token to identify the client session with the OP when the frontchannel-logout-callback is used. If omitted, the default value is false.',
      type: 'boolean'
    },
    {
      label: 'grant-type',
      description: 'A list of allowed grant types. (default [authorization_code])',
      type: 'strings'
    },
    {
      label: 'jwks-uri',
      description:
        'Define the URL where the JSON Web Key Set should be fetched from when performing the private_key_jwt client authentication method.',
      type: 'string'
    },
    { label: 'keybase', description: 'Keybase username for encrypting client secret.', type: 'string' },
    { label: 'logo-uri', description: 'A URL string that references a logo for the client.', type: 'string' },
    {
      label: 'metadata',
      description: 'Metadata is an arbitrary JSON String of your choosing. (default "{}").',
      type: 'string'
    },
    { label: 'name', description: "The client's name.", type: 'string' },
    {
      label: 'owner',
      description: 'The owner of this client, typically email addresses or a user ID.',
      type: 'string'
    },
    {
      label: 'pgp-key',
      description: 'Base64 encoded PGP encryption key for encrypting client secret.',
      type: 'string'
    },
    { label: 'pgp-key-url', description: 'PGP encryption key URL for encrypting client secret.', type: 'string' },
    {
      label: 'policy-uri',
      description:
        'A URL string that points to a human-readable privacy policy document that describes how the deployment organization collects, uses, retains, and discloses personal data.',
      type: 'string'
    },
    {
      label: 'post-logout-callback',
      description: 'List of allowed URLs to be redirected to after a logout.',
      type: 'strings'
    },
    { label: 'project', description: 'The project to use, either project ID or a (partial) slug.', type: 'string' },
    { label: 'redirect-uri', description: 'List of allowed OAuth2 Redirect URIs.', type: 'strings' },
    {
      label: 'request-object-signing-alg',
      description: 'Algorithm that must be used for signing Request Objects sent to the OP. (default "RS256")',
      type: 'string'
    },
    {
      label: 'request-uri',
      description: 'Array of request_uri values that are pre-registered by the RP for use at the OP.',
      type: 'strings'
    },
    { label: 'response-type', description: 'A list of allowed response types. (default [code])', type: 'strings' },
    { label: 'scope', description: 'The scope the client is allowed to request.', type: 'strings' },
    { label: 'secret', description: "Provide the client's secret.", type: 'string' },
    {
      label: 'sector-identifier-uri',
      description:
        'URL using the https scheme to be used in calculating Pseudonymous Identifiers by the OP. The URL references a file with a single JSON array of redirect_uri values.',
      type: 'string'
    },
    {
      label: 'subject-type',
      description: 'A identifier algorithm. Valid values are public and `pairwise`. (default "public")',
      type: 'string'
    },
    {
      label: 'token-endpoint-auth-method',
      description:
        'Define which authentication method the client may use at the Token Endpoint. Valid values are client_secret_post, `client_secret_basic`, `private_key_jwt`, and `none`. (default "client_secret_basic")',
      type: 'string'
    },
    {
      label: 'tos-uri',
      description:
        'A URL string that points to a human-readable terms of service document for the client that describes a contractual relationship between the end-user and the client that the end-user accepts when authorizing the client.',
      type: 'string'
    }
  ];

  const result = await vscode.window.showQuickPick([...flags], {
    placeHolder: 'Pick to options...',
    title: 'Oauth2-client',
    canPickMany: true
  });

  if (result === undefined) {
    vscode.window.showErrorMessage(`Invalid option ${result}`);
    return [];
  }
  console.log(result, typeof result);

  const flagsValue: Map<string, string> = new Map();

  for (let i = 0; i < result?.length; ) {
    let errorBool: Boolean = false;
    await getOauth2FlagsInput(result[i])
      .then((value) => {
        console.log('from oauth2: ' + value);
        if (value === undefined) {
          return;
        }
        flagsValue.set(result[i].label, value);
        i++;
      })
      .catch((e) => {
        console.log('from oauth2 err: ' + e);
        errorBool = true;
        return;
      });

    if (errorBool === true) {
      return [];
    }
  }

  console.log('Flag values: ' + flagsValue);
  let stringBuilder: string[] = [];
  flagsValue.forEach((value: string, key: string) => {
    stringBuilder.push('--' + key + '=' + value);
  });

  console.log(stringBuilder);
  return stringBuilder;
}

async function getOauth2FlagsInput(obj: {
  label: string;
  description: string;
  type: string;
}): Promise<string | undefined> {
  let flagInput = await vscode.window.showInputBox({
    title: obj.label,
    placeHolder:
      obj.type === 'string'
        ? 'Enter ' + obj.label
        : obj.type === 'boolean'
        ? 'Enter true or false'
        : 'Enter multiple inputs "," (comma-separated). ex- cat, dog',
    prompt: obj.description,
    ignoreFocusOut: true
  });

  if (flagInput === undefined) {
    vscode.window.showErrorMessage(`Invalid flag value ${flagInput}`);

    throw new Error(undefined);
  }

  if (obj.type === 'strings') {
    flagInput = flagInput.replace(' ', '');
  }

  return flagInput;
}
