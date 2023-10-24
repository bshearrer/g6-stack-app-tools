import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { formatFileWithPrettier, toPascalCase } from './util/format';
import { getProcedureTemplate } from './util/templates/api/getProcedureTemplate';
import { getServiceTemplate } from './util/templates/api/getServiceTemplate';
import { inputTemplate } from './util/templates/api/inputTemplate';
import path = require('path');

export function createTRPCRoute() {
	return vscode.commands.registerCommand('extension.createTRPCRoute', () => {
		getRouteName()
			.then((routeName) => {
				if (routeName.includes('-') || routeName.includes(' ')) {
					routeName = toPascalCase(routeName);
				}
				return createRouteFiles(routeName);
			})
			.then((routeName) => updateRootFile(routeName))
			.catch(showError);
	});
}

function showError(message: string) {
	vscode.window.showErrorMessage(message);
}

async function getRouteName(): Promise<string> {
	const routeNameInput = await vscode.window.showInputBox({
		prompt: 'Enter route name (ex: user, appointments, etc.): ',
	});
	if (!routeNameInput) {
		throw new Error('Route name is required!');
	}
	// Remove "Router" or "router" suffix if it exists
	let routeName = routeNameInput;
	if (routeNameInput.toLowerCase().endsWith('router')) {
		routeName = routeNameInput.slice(0, -6);
	}

	return routeName;
}

function getWorkspacePath() {
	const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
	if (!workspacePath) {
		throw new Error('No workspace detected.');
	}
	return workspacePath;
}

function createRouteFiles(routeName: string): Promise<string> {
	const workspacePath = getWorkspacePath();
	const routesPath = path.join(workspacePath, `/src/server/api/routers/${routeName}/`);

	if (!existsSync(routesPath)) {
		mkdirSync(routesPath, { recursive: true });
	}

	const routeFilePath = path.join(routesPath, `${routeName}.procedures.ts`);
	const serviceFilePath = path.join(routesPath, `${routeName}.service.ts`);
	const inputsFilePath = path.join(routesPath, `${routeName}.inputs.ts`);

	writeFileSync(routeFilePath, getProcedureTemplate(routeName).trim(), 'utf-8');
	writeFileSync(serviceFilePath, getServiceTemplate(routeName).trim(), 'utf-8');
	writeFileSync(inputsFilePath, inputTemplate.trim(), 'utf-8');

	formatFileWithPrettier(routeFilePath);
	formatFileWithPrettier(serviceFilePath);
	formatFileWithPrettier(inputsFilePath);

	vscode.window.showInformationMessage('Route files created successfully!');

	return Promise.resolve(routeName);
}

function updateRootFile(routeName: string) {
	const workspacePath = getWorkspacePath();
	const rootFilePath = path.join(workspacePath, '/src/server/api/root.ts');

	if (existsSync(rootFilePath)) {
		let content = readFileSync(rootFilePath, 'utf8');
		content = insertIntoRoot(content, routeName);

		writeFileSync(rootFilePath, content, 'utf8');
		formatFileWithPrettier(rootFilePath);

		vscode.window.showInformationMessage('root.ts updated successfully!');
	} else {
		throw new Error('root.ts not found.');
	}
}

function insertIntoRoot(content: string, routeName: string) {
	const importStatement = `import { ${routeName}Router } from '~/server/api/routers/${routeName}/${routeName}.procedures';`;
	const routerMapping = `${routeName}: ${routeName}Router`;

	content = importStatement + '\n' + content;

	const routerStart = content.indexOf('createTRPCRouter({') + 18;
	const routerEnd = content.indexOf('});', routerStart);
	const routerContent = content.slice(routerStart, routerEnd);

	const routerLines = routerContent
		.split(',')
		.map((line) => line.trim())
		.filter((line) => line);
	routerLines.push(routerMapping);
	const sortedRouterLines = routerLines.sort();

	const newRouterContent = sortedRouterLines.join(',\n    ');
	return content.slice(0, routerStart) + newRouterContent + content.slice(routerEnd);
}
