export const getPageTemplate = (pageName: string) => {
	return `
import { ${getPageTemplate}Screen } from '~/features/screens/${getPageTemplate}';

export const ${getPageTemplate} = () => {
    return <${getPageTemplate}Screen />;
}

export default ${getPageTemplate};
`.trim();
};
