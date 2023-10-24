import path = require('path');
import { readFileSync, writeFileSync } from 'fs';
import { format } from 'prettier';

export async function formatFileWithPrettier(filePath: string) {
	const content = readFileSync(filePath, 'utf8');
	const formatted = await format(content, { parser: 'typescript', tabWidth: 4, singleQuote: true });
	writeFileSync(filePath, formatted, 'utf8');
}

export function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function lowerCaseFirstLetter(string: string) {
	return string.charAt(0).toLowerCase() + string.slice(1);
}

//function that converts spaces in strings or dashes in strings to pascal case
export function toPascalCase(string: string) {
	return string
		.split(/ |-/)
		.map((word, index) => (index === 0 ? word : capitalizeFirstLetter(word)))
		.join('');
}
