// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "comet-commit-message-generator" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	const disposable = vscode.commands.registerCommand('comet-commit-message-generator.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from comet-commit-message-generator!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}

import * as vscode from 'vscode';
import axios from 'axios';
import simpleGit from 'simple-git';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.generateCommitMessage', async () => {
        const diff = await getGitDiff();
        if (!diff) {
            vscode.window.showErrorMessage("No staged changes found!");
            return;
        }

        const commitMessage = await generateCommitMessage(diff);

        if (commitMessage) {
            // Insert into Git commit input
            await vscode.commands.executeCommand('workbench.view.scm');
            // await vscode.commands.executeCommand('git.inputBox', commitMessage);
            const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
            if (gitExtension) {
                const api = gitExtension.getAPI(1);
                const repo = api.repositories[0];
                if (repo) {
                    repo.inputBox.value = commitMessage;
                } else {
                    vscode.window.showErrorMessage('No Git repository found.');
                }
            } else {
                vscode.window.showErrorMessage('Git extension not found.');
            }
                    }
    });

    context.subscriptions.push(disposable);
}

// async function getGitDiff(): Promise<string> {
//     try {
//         const gitInstance = simpleGit();
//         const diff = await gitInstance.diff(['--staged']);  // Fetch staged changes only
//         return diff || '';
//     } catch (error) {
//         vscode.window.showErrorMessage('Error fetching Git diff');
//         return '';
//     }
// }
async function getGitDiff(): Promise<string> {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return '';
        }

        const gitInstance = simpleGit(workspaceFolders[0].uri.fsPath);
        const diff = await gitInstance.diff(['--staged']); // Fetches staged changes only

        if (!diff.trim()) {
            vscode.window.showWarningMessage('No staged changes found.');
            return '';
        }

        return diff;
    } catch (error) {
        vscode.window.showErrorMessage('Error fetching Git diff: ' + error);
        return '';
    }
}

async function generateCommitMessage(diff: string): Promise<string> {
    try {
        const response = await axios.post('http://0.0.0.0:8000/generate', { diff });
        return response.data.commit_message;  // Fixed key name
    } catch (error) {
        vscode.window.showErrorMessage('Error generating commit message');
        return '';
    }
}
