import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { capitalizeFirstLetter, formatFileWithPrettier } from './util/format';
import { getUIComponentTemplate } from './util/templates/client/getUIComponentTemplate';
import path = require('path');

export function createUIComponent() {
	return vscode.commands.registerCommand('extension.createUIComponent', async () => {
		const workspacePath = getWorkspacePath();
		if (!workspacePath) {
			return showError('No workspace detected.');
		}

		const uiFolderPath = path.join(workspacePath, 'src/features/ui');
		const existingFolders = getExistingFolders(uiFolderPath);

		const selectedOption = await getSelectedOption(existingFolders);
		if (!selectedOption) {
			return;
		}

		const folderName = await determineFolderName(selectedOption, uiFolderPath);
		if (!folderName) {
			return showError('Folder selection failed. Please try again.');
		}

		const componentName = await getComponentName();
		if (!componentName) {
			return showError('Component name is required!');
		}

		const componentFilePath = createComponent(folderName, componentName, uiFolderPath);
		if (!componentFilePath) {
			return showError(`Component "${componentName}.tsx" already exists.`);
		}

		formatFileWithPrettier(componentFilePath);
		vscode.window.showInformationMessage(
			`UI Component "${componentName}.tsx" created successfully in ${folderName} folder!`,
		);
	});
}

function showError(message: string) {
	vscode.window.showErrorMessage(message);
}

function getWorkspacePath() {
	return vscode.workspace.workspaceFolders?.[0].uri.fsPath;
}

function getExistingFolders(uiFolderPath: string) {
	try {
		return readdirSync(uiFolderPath).filter((folderName) => {
			const folderPath = path.join(uiFolderPath, folderName);
			return existsSync(folderPath) && statSync(folderPath).isDirectory();
		});
	} catch {
		showError('Failed to read existing UI folders.');
		return [];
	}
}

async function getSelectedOption(existingFolders: string[]) {
	const folderOptions = ['New Folder', ...existingFolders];
	return await vscode.window.showQuickPick(folderOptions, { placeHolder: 'Select a folder or create a new one' });
}

async function determineFolderName(selectedOption: string, uiFolderPath: string) {
	let folderName: string | undefined = selectedOption;
	if (selectedOption === 'New Folder') {
		folderName = await vscode.window.showInputBox({ prompt: 'Enter the name of the new folder:' });
		if (!folderName) {
			showError('Folder name is required!');
			return undefined;
		}
		folderName = folderName.replace(/\s+/g, '-');
		const componentFolder = path.join(uiFolderPath, folderName);
		if (!existsSync(componentFolder)) {
			mkdirSync(componentFolder, { recursive: true });
		}
	}
	return folderName;
}

async function getComponentName() {
	let componentName = await vscode.window.showInputBox({ prompt: 'Enter the name of the new UI component:' });
	if (componentName) {
		componentName = componentName.replace(/\s+/g, '');
		['.ts', '.tsx', '.js', '.jsx'].forEach((ext) => {
			if (componentName && componentName.endsWith(ext)) {
				componentName = componentName.replace(ext, '');
			}
		});
	}
	return componentName;
}

function createComponent(folderName: string, componentName: string, uiFolderPath: string) {
	const componentFolder = path.join(uiFolderPath, folderName);
	const formattedComponentName = capitalizeFirstLetter(componentName);
	const componentFilePath = path.join(componentFolder, `${formattedComponentName}.tsx`);
	if (existsSync(componentFilePath)) {
		return undefined;
	}
	writeFileSync(componentFilePath, getUIComponentTemplate(formattedComponentName), 'utf-8');
	return componentFilePath;
}
