import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { capitalizeFirstLetter, formatFileWithPrettier, lowerCaseFirstLetter } from './util/format';
import { getFeatureTemplate } from './util/templates/client/getFeatureTemplate';
import { getPageTemplate } from './util/templates/client/pageTemplate';
import path = require('path');

export function createNextPage() {
	return vscode.commands.registerCommand('extension.createNextPage', async () => {
		const workspacePath = getWorkspacePath();
		if (!workspacePath) {
			vscode.window.showErrorMessage('No workspace detected.');
			return;
		}

		const pagesPath = path.join(workspacePath, 'src/pages');
		let currentDir = pagesPath;
		let dirSelection: string | null = null;

		do {
			dirSelection = await handleDirectorySelection(currentDir, pagesPath);
			if (dirSelection && dirSelection !== 'Create File Here') {
				currentDir = dirSelection;
			}
		} while (dirSelection && dirSelection !== 'Create File Here');

		if (!dirSelection) {
			return;
		}

		const pageName = await getPageName();
		if (!pageName) {
			vscode.window.showErrorMessage('Page name is required!');
			return;
		}

		const featureName = await getFeatureName(pageName);
		if (!featureName) {
			vscode.window.showErrorMessage('Feature name is required for index page!');
			return;
		}

		const formattedPageName = lowerCaseFirstLetter(pageName.replace(/\.tsx|\.ts|\.jsx|\.js/g, ''));
		const formattedFeatureName = capitalizeFirstLetter(featureName.replace(/\.tsx|\.ts|\.jsx|\.js/g, ''));

		const normalizedPath = path.join(currentDir.replace(pagesPath, ''), formattedPageName);
		const fullPagePath = path.join(pagesPath, `${normalizedPath}.tsx`);
		const pageDirectory = path.dirname(fullPagePath);

		createDirectories([pageDirectory]);

		if (existsSync(fullPagePath)) {
			vscode.window.showErrorMessage(`Page "${normalizedPath}.tsx" already exists.`);
			return;
		}

		writeFileSync(fullPagePath, getPageTemplate(formattedFeatureName), 'utf-8');
		formatFileWithPrettier(fullPagePath);
		vscode.window.showInformationMessage(`Page "${normalizedPath}.tsx" created successfully!`);

		const featureFilePath = path.join(workspacePath, `/src/features/screens/${formattedFeatureName}/index.tsx`);
		const featureDirectory = path.dirname(featureFilePath);

		createDirectories([featureDirectory, featureFilePath]);

		writeFileSync(featureFilePath, getFeatureTemplate(formattedFeatureName), 'utf-8');
		formatFileWithPrettier(featureFilePath);

		const dirsToCreate = [
			path.join(featureDirectory, 'components'),
			path.join(featureDirectory, 'common'),
			path.join(featureDirectory, 'common', 'util'),
			path.join(featureDirectory, 'common', 'hooks'),
		];

		createDirectories(dirsToCreate);
		vscode.window.showInformationMessage(`Feature "${formattedFeatureName}/index.tsx" created successfully!`);
	});
}

function getWorkspacePath(): string | null {
	return vscode.workspace.workspaceFolders?.[0].uri.fsPath || null;
}

function getDirectories(currentDir: string): string[] {
	return readdirSync(currentDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory() && dirent.name !== 'api')
		.map((dirent) => '/' + dirent.name);
}

async function handleDirectorySelection(currentDir: string, pagesPath: string): Promise<string | null> {
	const dirs = getDirectories(currentDir);
	const options =
		currentDir === pagesPath
			? ['Create File Here', 'Create New Directory', ...dirs]
			: ['Create File Here', 'Create New Directory', ...dirs, '<- Back'];

	const dirSelection = await vscode.window.showQuickPick(options, { placeHolder: 'Select an option or directory' });

	if (!dirSelection) {
		return null;
	} // User canceled

	if (dirSelection === '<- Back') {
		return path.dirname(currentDir);
	}

	if (dirSelection === 'Create New Directory') {
		const newDirName = await vscode.window.showInputBox({ prompt: 'Enter directory name:' });
		if (!newDirName) {
			return null;
		} // User canceled

		const newDirPath = path.join(currentDir, newDirName);
		if (!existsSync(newDirPath)) {
			mkdirSync(newDirPath);
		}
		return newDirPath;
	}

	if (dirSelection !== 'Create File Here') {
		return path.join(currentDir, dirSelection);
	}

	return dirSelection;
}

async function getPageName(): Promise<string | null | undefined> {
	return await vscode.window.showInputBox({ prompt: 'Enter page name:' });
}

async function getFeatureName(pageName: string): Promise<string | null | undefined> {
	if (pageName.toLowerCase() !== 'index') {
		return pageName;
	}

	return await vscode.window.showInputBox({ prompt: 'Enter feature name for index page:' });
}

function createDirectories(paths: string[]): void {
	paths.forEach((dir) => {
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	});
}
