import path = require('path');
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { formatFileWithPrettier } from './util/format';
import { getFeatureTemplate } from './util/templates/client/getFeatureTemplate';
import { getPageTemplate } from './util/templates/client/pageTemplate';

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

			// Write the main page file
			writeFileSync(fullPagePath, getPageTemplate(pageName), 'utf-8');

			// Format the main page file
			formatFileWithPrettier(fullPagePath);

			// Construct path for the new feature file
			const featureFilePath = path.join(workspacePath, `/src/features/screens/${pageName}/index.tsx`);
			const featureDirectory = path.dirname(featureFilePath);

			// Create feature directory if it doesn't exist
			if (!existsSync(featureDirectory)) {
				mkdirSync(featureDirectory, { recursive: true });
			}

			// Write the feature file
			writeFileSync(featureFilePath, getFeatureTemplate(pageName), 'utf-8');

			// Format the feature file
			formatFileWithPrettier(featureFilePath);

			// Show success messages
			vscode.window.showInformationMessage(`Page "${normalizedPath}.tsx" created successfully!`);
			vscode.window.showInformationMessage(`Feature "${pageName}/index.tsx" created successfully!`);
		});
	});
}
