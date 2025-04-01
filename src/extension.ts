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
import simpleGit from 'simple-git';// Correct import for simple-git

export function activate(context: vscode.ExtensionContext) {
    // Register a new command for generating commit messages
    let disposable = vscode.commands.registerCommand('extension.generateCommitMessage', async () => {
        
        // Step 1: Fetch the current git diff (staged changes)
        const diff = await getGitDiff();

        // Step 2: Send the diff to your Comet commit message model
        const commitMessage = await generateCommitMessage(diff);

        // Step 3: Insert the generated commit message into the commit input box
        const commitInput = vscode.window.activeTextEditor;
        if (commitInput) {
            commitInput.insertSnippet(new vscode.SnippetString(commitMessage));
        }
    });

    context.subscriptions.push(disposable);
}

// Function to get the git diff (staged changes)
async function getGitDiff(): Promise<string> {
    try {
        const gitInstance = simpleGit();  // Correct instantiation of simple-git
        const diff = await gitInstance.diff();  // Fetches the diff of staged changes
        return diff;
    } catch (error) {
        vscode.window.showErrorMessage('Error fetching Git diff');
        return '';
    }
}

// Function to send the diff to the Comet API and generate a commit message
async function generateCommitMessage(diff: string): Promise<string> {
    try {
        const response = await axios.post('http://your-api-url/generate', {
            diff: diff
        });
        return response.data.commitMessage;
    } catch (error) {
        vscode.window.showErrorMessage('Error generating commit message');
        return 'Failed to generate commit message';
    }
}
