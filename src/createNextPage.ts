import path = require('path');
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { formatFileWithPrettier } from './util/format';
import { pageTemplate } from './util/templates/client/pageTemplate';

export function createNextPage() {
	return vscode.commands.registerCommand('extension.createNextPage', () => {
		vscode.window.showInputBox({ prompt: 'Enter page path (e.g., /new/index):' }).then(async (pagePath) => {
			// Show error if no path is entered
			if (!pagePath) {
				vscode.window.showErrorMessage('Page path is required!');
				return;
			}

			// Get the workspace path
			const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

			// Show error if no workspace is detected
			if (!workspacePath) {
				vscode.window.showErrorMessage('No workspace detected.');
				return;
			}

			// Replace spaces with underscores
			pagePath = pagePath.replace(/\s+/g, '_');

			// Normalize the path (remove leading and trailing slashes)
			const normalizedPath = pagePath.replace(/^\//, '').replace(/\/$/, '');

			// Construct full path for the file
			const fullPagePath = path.join(workspacePath, `/src/pages/${normalizedPath}.tsx`);
			const pageDirectory = path.dirname(fullPagePath);

			// Create the directory if it doesn't exist
			if (!existsSync(pageDirectory)) {
				mkdirSync(pageDirectory, { recursive: true });
			}

			// Check if the page already exists
			if (existsSync(fullPagePath)) {
				vscode.window.showErrorMessage(`Page "${normalizedPath}.tsx" already exists.`);
				return;
			}

			// Extract the page name from the path to use in the template
			const pageName = path.basename(normalizedPath);

			// Write the file
			writeFileSync(fullPagePath, pageTemplate(pageName), 'utf-8');

			// Format the file
			formatFileWithPrettier(fullPagePath);

			// Show success message
			vscode.window.showInformationMessage(`Page "${normalizedPath}.tsx" created successfully!`);
		});
	});
}
