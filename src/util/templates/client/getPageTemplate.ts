export const getPageTemplate = (pageName: string) => {
	return `
import { ${pageName}Screen } from '~/features/screens/${pageName}';

export const ${pageName} = () => {
    return <${pageName}Screen />;
}

export default ${pageName};
`.trim();
};
