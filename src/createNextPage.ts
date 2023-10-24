import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { capitalizeFirstLetter, formatFileWithPrettier, lowerCaseFirstLetter } from './util/format';
import { getFeatureTemplate } from './util/templates/client/getFeatureTemplate';
import { getPageTemplate } from './util/templates/client/pageTemplate';
import path = require('path');

export function createNextPage() {
	return vscode.commands.registerCommand('extension.createNextPage', async () => {
		const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		if (!workspacePath) {
			vscode.window.showErrorMessage('No workspace detected.');
			return;
		}

		const pagesPath = path.join(workspacePath, 'src/pages');

		let currentDir = pagesPath;
		let dirSelection = null;

		// Navigate through directories until the user selects where to create the file or cancels the operation.
		do {
			const dirs = readdirSync(currentDir, { withFileTypes: true })
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => '/' + dirent.name);

			const options =
				currentDir === pagesPath ? ['Create File Here', ...dirs] : ['Create File Here', ...dirs, '<- Back'];

			dirSelection = await vscode.window.showQuickPick(options, { placeHolder: 'Select an option or directory' });

			if (!dirSelection) {
				// User canceled the operation
				return;
			}

			if (dirSelection === 'Back') {
				// Go up one directory
				currentDir = path.dirname(currentDir);
			} else if (dirSelection !== 'Create File Here') {
				// Dive into selected directory
				currentDir = path.join(currentDir, dirSelection);
			}
		} while (dirSelection !== 'Create File Here');

		const pageName = await vscode.window.showInputBox({ prompt: 'Enter page name:' });
		if (!pageName) {
			vscode.window.showErrorMessage('Page name is required!');
			return;
		}

		let formattedPageName = pageName.replace(/\.tsx|\.ts|\.jsx|\.js/g, '');
		formattedPageName = capitalizeFirstLetter(formattedPageName);

		const normalizedPath = path.join(currentDir.replace(pagesPath, ''), formattedPageName);
		const fullPagePath = path.join(pagesPath, `${lowerCaseFirstLetter(normalizedPath)}.tsx`);
		const pageDirectory = path.dirname(fullPagePath);

		if (!existsSync(pageDirectory)) {
			mkdirSync(pageDirectory, { recursive: true });
		}

		if (existsSync(fullPagePath)) {
			vscode.window.showErrorMessage(`Page "${normalizedPath}.tsx" already exists.`);
			return;
		}

		writeFileSync(fullPagePath, getPageTemplate(formattedPageName), 'utf-8');
		formatFileWithPrettier(fullPagePath);
		vscode.window.showInformationMessage(
			`Page "${lowerCaseFirstLetter(normalizedPath)}.tsx" created successfully!`,
		);

		const featureFilePath = path.join(workspacePath, `/src/features/screens/${formattedPageName}/index.tsx`);
		const featureDirectory = path.dirname(featureFilePath);

		if (!existsSync(featureDirectory)) {
			mkdirSync(featureDirectory, { recursive: true });
		}

		writeFileSync(featureFilePath, getFeatureTemplate(capitalizeFirstLetter(formattedPageName)), 'utf-8');
		formatFileWithPrettier(featureFilePath);

		const componentPath = path.join(featureDirectory, 'components');
		const commonPath = path.join(featureDirectory, 'common');
		const utilPath = path.join(commonPath, 'util');
		const hooksPath = path.join(commonPath, 'hooks');

		[componentPath, commonPath, utilPath, hooksPath].forEach((dir) => {
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}
		});

		vscode.window.showInformationMessage(`Feature "${formattedPageName}/index.tsx" created successfully!`);
	});
}
