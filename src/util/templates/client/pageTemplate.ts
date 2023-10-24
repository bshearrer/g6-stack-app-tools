import { capitalizeFirstLetter } from '../../format';

export const pageTemplate = (pageName: string) => {
	const capitalizedPageName = capitalizeFirstLetter(pageName);
	return `
import { ${capitalizedPageName}Screen } from '~/features/screens/${capitalizedPageName}';

export const ${capitalizedPageName} = () => {
    return <${capitalizedPageName}Screen />;
}

export default ${capitalizedPageName};
`.trim();
};
