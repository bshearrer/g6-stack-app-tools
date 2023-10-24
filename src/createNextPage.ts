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

		do {
			const dirs = readdirSync(currentDir, { withFileTypes: true })
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => '/' + dirent.name);

			const options =
				currentDir === pagesPath
					? ['Create File Here', 'Create New Directory', ...dirs]
					: ['Create File Here', 'Create New Directory', ...dirs, '<- Back'];

			dirSelection = await vscode.window.showQuickPick(options, { placeHolder: 'Select an option or directory' });

			if (!dirSelection) {
				return; // User canceled
			}

			if (dirSelection === '<- Back') {
				currentDir = path.dirname(currentDir);
			} else if (dirSelection === 'Create New Directory') {
				const newDirName = await vscode.window.showInputBox({ prompt: 'Enter directory name:' });
				if (!newDirName) {
					return; // User canceled
				}
				const newDirPath = path.join(currentDir, newDirName);
				if (!existsSync(newDirPath)) {
					mkdirSync(newDirPath);
				}
				currentDir = newDirPath;
			} else if (dirSelection !== 'Create File Here') {
				currentDir = path.join(currentDir, dirSelection);
			}
		} while (dirSelection !== 'Create File Here');

		let pageName = await vscode.window.showInputBox({ prompt: 'Enter page name:' });
		if (!pageName) {
			vscode.window.showErrorMessage('Page name is required!');
			return;
		}

		let featureName: string | undefined = pageName;
		if (pageName.toLowerCase() === 'index') {
			featureName = await vscode.window.showInputBox({ prompt: 'Enter feature name for index page:' });
			if (!featureName) {
				vscode.window.showErrorMessage('Feature name is required for index page!');
				return;
			}
		}

		const formattedPageName = lowerCaseFirstLetter(pageName.replace(/\.tsx|\.ts|\.jsx|\.js/g, ''));
		const formattedFeatureName = capitalizeFirstLetter(featureName.replace(/\.tsx|\.ts|\.jsx|\.js/g, ''));

		const normalizedPath = path.join(currentDir.replace(pagesPath, ''), formattedPageName);
		const fullPagePath = path.join(pagesPath, `${normalizedPath}.tsx`);
		const pageDirectory = path.dirname(fullPagePath);

		if (!existsSync(pageDirectory)) {
			mkdirSync(pageDirectory, { recursive: true });
		}

		if (existsSync(fullPagePath)) {
			vscode.window.showErrorMessage(`Page "${normalizedPath}.tsx" already exists.`);
			return;
		}

		writeFileSync(fullPagePath, getPageTemplate(formattedFeatureName), 'utf-8');
		formatFileWithPrettier(fullPagePath);
		vscode.window.showInformationMessage(`Page "${normalizedPath}.tsx" created successfully!`);

		const featureFilePath = path.join(workspacePath, `/src/features/screens/${formattedFeatureName}/index.tsx`);
		const featureDirectory = path.dirname(featureFilePath);

		if (!existsSync(featureDirectory)) {
			mkdirSync(featureDirectory, { recursive: true });
		}

		writeFileSync(featureFilePath, getFeatureTemplate(formattedFeatureName), 'utf-8');
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

		vscode.window.showInformationMessage(`Feature "${formattedFeatureName}/index.tsx" created successfully!`);
	});
}
