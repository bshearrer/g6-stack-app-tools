# G6 Stack App Tools

## Description
G6 Stack App Tools is a Visual Studio Code extension designed to offer a suite of utilities to aid in creating new screens, components, and routes for your g6 stack app. This extension aims to streamline the development workflow and make the addition of new UI components, tRPC routes, and Next.js pages a breeze.

## Features
1. G6 Stack - Create tRPC Route: This command facilitates the creation of a new tRPC route, including the necessary service and procedure files. It also helps you integrate the route into your app's main root.ts file.

2. G6 Stack - Create Next Page: An efficient way to scaffold a new Next.js page.

3. G6 Stack - Create UI Component: Quickly design a new UI component. Choose from existing folders or create a new one, and the command will handle the folder creation and template addition for you.

## Requirements
- VS Code version 1.83.0 or later.


## Installation
You can install this extension directly from the Visual Studio Code Marketplace. Search for "G6 Stack App Tools" and click on "Install".

## Usage
1. Open your g6 stack app in VS Code.
2. Use the command palette (Ctrl+Shift+P or Cmd+Shift+P on macOS) and type in the desired command (G6 Stack - Create tRPC Route, G6 Stack - Create Next Page, or G6 Stack - Create UI Component).
3. Follow the prompts in VS Code to define names and other details.
4. The necessary files will be generated and integrated accordingly.

## Development
If you wish to contribute or modify the extension for personal use, here are the main development scripts:

- Compile: yarn run compile
- Watch: yarn run watch
- Package: yarn run package
- Lint: yarn run lint
- Test: yarn run test

Remember to always ensure that your changes adhere to linting rules and pass the test suite.

## Dependencies
This extension uses various packages, such as:

- prettier for code formatting
- webpack for bundling the source files
- typescript for type checking and transpiling
- eslint for linting the codebase

## Feedback and Contribution
Feedback and contributions are always welcome. Please open an issue on the GitHub repository if you encounter any problems or have suggestions for improvements.

## License
Please refer to the license file included in the repository.
***
### Enjoy coding with the G6 Stack App Tools extension! 🚀

