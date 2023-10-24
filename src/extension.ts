import path = require('path');
import * as vscode from 'vscode';
import { createTRPCRoute } from './createTRPCRoute';
import { createNextPage } from './createNextPage';
import { createUIComponent } from './createUIComponent';

export function activate(context: vscode.ExtensionContext) {
	const trpcRouteDisposable = createTRPCRoute();
	context.subscriptions.push(trpcRouteDisposable);

	const nextPageDisposable = createNextPage();
	context.subscriptions.push(nextPageDisposable);

	const uiComponentDisposable = createUIComponent();
	context.subscriptions.push(uiComponentDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
