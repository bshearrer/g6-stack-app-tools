import path = require('path');
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { format } from 'prettier';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "next-app-tools" is now active!');

	let disposable = vscode.commands.registerCommand('extension.createTRPCRoute', () => {
		vscode.window.showInputBox({ prompt: 'Enter route name:' }).then(async (routeName) => {
			if (!routeName) {
				vscode.window.showErrorMessage('Route name is required!');
				return;
			}

			const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
			if (!workspacePath) {
				vscode.window.showErrorMessage('No workspace detected.');
				return;
			}

			const routesPath = path.join(workspacePath, `/src/server/api/routers/${routeName}/`);
			if (!existsSync(routesPath)) {
				mkdirSync(routesPath, { recursive: true });
			}

			const routeFilePath = path.join(routesPath, `${routeName}.ts`);
			const serviceFilePath = path.join(routesPath, `${routeName}.service.ts`);
			const inputsFilePath = path.join(routesPath, `${routeName}.inputs.ts`);

			writeFileSync(routeFilePath, routeTemplate(routeName).trim(), 'utf-8');
			writeFileSync(serviceFilePath, serviceTemplate(routeName).trim(), 'utf-8');
			writeFileSync(inputsFilePath, inputsTemplate.trim(), 'utf-8');

			formatFileWithPrettier(routeFilePath);
			formatFileWithPrettier(serviceFilePath);
			formatFileWithPrettier(inputsFilePath);

			vscode.window.showInformationMessage('Route files created successfully!');

			const rootFilePath = path.join(workspacePath, '/src/server/api/root.ts');

			if (existsSync(rootFilePath)) {
				let content = readFileSync(rootFilePath, 'utf8');

				const importStatement = `import { ${routeName}Router } from '~/server/api/routers/${routeName}/${routeName}';`;
				const routerMapping = `${routeName}: ${routeName}Router`;

				// Add the import at the top
				content = importStatement + '\n' + content;

				// Extract router mappings from createTRPCRouter
				const routerStart = content.indexOf('createTRPCRouter({') + 18;
				const routerEnd = content.indexOf('});', routerStart);
				const routerContent = content.slice(routerStart, routerEnd);

				// Split router mappings into lines, add new router, sort, and join
				const routerLines = routerContent
					.split(',')
					.map((line) => line.trim())
					.filter((line) => line);
				routerLines.push(routerMapping);
				const sortedRouterLines = routerLines.sort();

				const newRouterContent = sortedRouterLines.join(',\n    ');
				content = content.slice(0, routerStart) + newRouterContent + content.slice(routerEnd);

				writeFileSync(rootFilePath, content, 'utf8');
				formatFileWithPrettier(rootFilePath);

				vscode.window.showInformationMessage('root.ts updated successfully!');
			} else {
				vscode.window.showErrorMessage('root.ts not found.');
			}
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function formatFileWithPrettier(filePath: string) {
	const content = readFileSync(filePath, 'utf8');
	const formatted = await format(content, { parser: 'typescript', tabWidth: 4, singleQuote: true });
	writeFileSync(filePath, formatted, 'utf8');
}

const routeTemplate = (routeName: string) => `
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import * as ${routeName}Inputs from './${routeName}.inputs';
import * as ${routeName}Service from './${routeName}.service';

export const ${routeName}Router = createTRPCRouter({
    hello: publicProcedure.input(${routeName}Inputs.helloInput).query(({ input }) => {
        return ${routeName}Service.greetUser(input.text);
    }),
});
`;

const inputsTemplate = `
import { z } from 'zod';

export const helloInput = z.object({
    text: z.string(),
});
`;

const serviceTemplate = (routeName: string) => `
export const greetUser = (userName: string) => {
    return \`Hello \${userName}\`;
};
`;
