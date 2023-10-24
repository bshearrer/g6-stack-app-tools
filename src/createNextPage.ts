import path = require('path');
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { capitalizeFirstLetter, formatFileWithPrettier } from './util/format';
import { getFeatureTemplate } from './util/templates/client/getFeatureTemplate';
import { getPageTemplate } from './util/templates/client/pageTemplate';

export function createNextPage() {
	return vscode.commands.registerCommand('extension.createNextPage', () => {
		vscode.window.showInputBox({ prompt: 'Enter page path (e.g., /new/index):' }).then(async (pagePath) => {
			if (!pagePath) {
				vscode.window.showErrorMessage('Page path is required!');
				return;
			}

			const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
			if (!workspacePath) {
				vscode.window.showErrorMessage('No workspace detected.');
				return;
			}

			pagePath = pagePath.replace(/\s+/g, '_');

			const normalizedPath = pagePath.replace(/^\//, '').replace(/\/$/, '');
			const fullPagePath = path.join(workspacePath, `/src/pages/${normalizedPath}.tsx`);
			const pageDirectory = path.dirname(fullPagePath);

			if (!existsSync(pageDirectory)) {
				mkdirSync(pageDirectory, { recursive: true });
			}

			if (existsSync(fullPagePath)) {
				vscode.window.showErrorMessage(`Page "${normalizedPath}.tsx" already exists.`);
				return;
			}

			const pageName = path.basename(normalizedPath);
			const formattedPageName = capitalizeFirstLetter(pageName);

			writeFileSync(fullPagePath, getPageTemplate(formattedPageName), 'utf-8');
			formatFileWithPrettier(fullPagePath);


			vscode.window.showInformationMessage(`Page "${normalizedPath}.tsx" created successfully!`);

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
	});
}
