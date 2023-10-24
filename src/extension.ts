import path = require('path');
import * as vscode from 'vscode';
import { createTRPCRoute } from './createTRPCRoute';
import { createNextPage } from './createNextPage';

export function activate(context: vscode.ExtensionContext) {
	const trpcRouteDisposable = createTRPCRoute();
	context.subscriptions.push(trpcRouteDisposable);

	const nextPageDisposable = createNextPage();
	context.subscriptions.push(nextPageDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
