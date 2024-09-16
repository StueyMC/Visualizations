# MooD - Custom Visualization

## Description

A solution for MooD to provide an improved, accessible and user friendly DataGrid component so that anyone can consume and interact with Tabulator data from MooD on the web using keyboard functionality and/or Assistive Technology.

#### File Structure
- root
  - Files which are used by Node
  - The final `custom_viz.zip` file
  - package.json (containing a list of commands you can use with `npm run`)
- src
  - visualization
    - __tests__
      - A folder where you can add automated unit tests
    - visualization.js
      - This is where you can edit your custom visualizer code
  - formatters
    - editors.js
      - This is where you can override the column's editor depending on the chosen formatter
    - formatters.js
      - This is where you can add or edit custom pre-built formatters
  - visualizationThemes
    - visualizationThemes.js
      - This is where you can add or edit custom pre-built themes for the visualizer
- demo
  - A folder containing a demo of the visualization using fixed data that you can run on the web
- dist
  - An automatically generated output folder
- node_modules
  - Another automatically generated output folder

## Installation

### Prerequisites

Node version 20.17.0 or later.\

### Suggested Development Tools

VS Code v1.89.1 or later.\
Prettier VS Code Extension v10.4.0 or later.\
ESLint VS Code Extension v2.4.4 or later.

### Getting Started

1. Set up Visual Studio Code and Node, see [Development Environment](../../README.md#development-environment)
2. Open this file: ```WebpackVisualization.code-workspace```
3. Run `npm install` to install the relevant node modules

### How To Use

- src\package.json.no-guid.ejs
- src\visualizer\package.json.no-guid.ejs

> The purpose of these files is to automatically generate a unique ID for the package/visualization.

1. Run `npm run generate-guids`

This will produce these 2 files:

- src\package.json.ejs
- src\visualizer\package.json.ejs

> The purpose of these files is to automatically increment the version number every time you build

2. Run `npm run build`

Which will produce:

- src\package.json
- src\visualizer\package.json
- custom_viz.zip

> These are automatically generated files which you shouldn't manually edit.

You can now import the `custom_viz.zip` file in to MooD.

To test the visualizer, run `npm run test .` to run all the automated unit tests.

### Demo Visualization

Run `npm run start` to run the demo-visualization on [http://localhost:8080/](http://localhost:8080/). This will open your browser showing template.html.

The demo visualization page will reload when you make changes to the main visualization code.

Interesting files:

- visualization.js: This is where your main code lives.
- demo-visualization.js: Hooks the template page in to the main visualization code.
- sample-data.json: This file passes fixed test data in to your demo visualization page.


You should also choose a preview image by changing ```visualization.png```.
