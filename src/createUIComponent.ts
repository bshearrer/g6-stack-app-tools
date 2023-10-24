import path = require('path');
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { capitalizeFirstLetter, formatFileWithPrettier } from './util/format';
import { getUIComponentTemplate } from './util/templates/client/getUIComponentTemplate';

export function createUIComponent() {
	return vscode.commands.registerCommand('extension.createUIComponent', async () => {
		const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		if (!workspacePath) {
			vscode.window.showErrorMessage('No workspace detected.');
			return;
		}

		const uiFolderPath = path.join(workspacePath, 'src/features/ui');

		let existingFolders: string[] = [];
		try {
			existingFolders = readdirSync(uiFolderPath).filter((folderName) => {
				const folderPath = path.join(uiFolderPath, folderName);
				return existsSync(folderPath) && statSync(folderPath).isDirectory();
			});
		} catch (error) {
			vscode.window.showErrorMessage('Failed to read existing UI folders.');
			return;
		}

		const folderOptions = ['New Folder', ...existingFolders];

		const selectedOption = await vscode.window.showQuickPick(folderOptions, {
			placeHolder: 'Select a folder or create a new one',
		});

		if (!selectedOption) {
			return;
		}

		let folderName: string | undefined;

		if (selectedOption === 'New Folder') {
			folderName = await vscode.window.showInputBox({
				prompt: 'Enter the name of the new folder:',
			});

			if (!folderName) {
				vscode.window.showErrorMessage('Folder name is required!');
				return;
			}
			folderName = folderName.replace(/\s+/g, '-');
		} else {
			folderName = selectedOption;
		}

		if (!folderName) {
			vscode.window.showErrorMessage('Folder selection failed. Please try again.');
			return;
		}
		const componentFolder = path.join(uiFolderPath, folderName);

		if (!existsSync(componentFolder)) {
			mkdirSync(componentFolder, { recursive: true });
		}

		let componentName = await vscode.window.showInputBox({
			prompt: 'Enter the name of the new UI component:',
		});
		if (!componentName) {
			vscode.window.showErrorMessage('Component name is required!');
			return;
		}
		componentName = componentName.replace(/\s+/g, '');

		const extensionsToRemove = ['.ts', '.tsx', '.js', '.jsx'];
		for (const ext of extensionsToRemove) {
			if (componentName.endsWith(ext)) {
				componentName = componentName.replace(ext, '');
			}
		}
		
		const componentFilePath = path.join(componentFolder, `${capitalizeFirstLetter(componentName)}.tsx`);

		if (existsSync(componentFilePath)) {
			vscode.window.showErrorMessage(`Component "${componentName}.tsx" already exists.`);
			return;
		}

		writeFileSync(componentFilePath, getUIComponentTemplate(componentName), 'utf-8'); // Initialize with an empty template or replace with your desired template function
		formatFileWithPrettier(componentFilePath);

		vscode.window.showInformationMessage(
			`UI Component "${componentName}.tsx" created successfully in ${folderName} folder!`,
		);
	});
}
