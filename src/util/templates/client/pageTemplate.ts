import { capitalizeFirstLetter } from '../../format';

export const pageTemplate = (pageName: string) => {
	return `
import React from 'react';

const ${capitalizeFirstLetter(pageName)}: React.FC = () => {
    return (
        <div>
            Welcome to the ${pageName} page!
        </div>
    );
}

export default ${capitalizeFirstLetter(pageName)};
`.trim();
};
