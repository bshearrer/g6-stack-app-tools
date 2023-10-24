export const getFeatureTemplate = (pageName: string) => {
	return `
    export const ${pageName}Screen = () => {
        return <h1>${pageName} Screen</h1>;
    };
    `.trim();
};
