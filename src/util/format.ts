import path = require('path');
import { readFileSync, writeFileSync } from 'fs';
import { format } from 'prettier';

export async function formatFileWithPrettier(filePath: string) {
	const content = readFileSync(filePath, 'utf8');
	const formatted = await format(content, { parser: 'typescript', tabWidth: 4, singleQuote: true });
	writeFileSync(filePath, formatted, 'utf8');
}
