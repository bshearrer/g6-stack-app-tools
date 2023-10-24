export const getUIComponentTemplate = (componentName: string) => {
	return `
    export const ${componentName} = () => {
        return <h1>${componentName} UI Component</h1>;
    };
    `.trim();
};
