const themePresets = {
  midnight: {
    properties: {
      "--background-color": "#333",
      "--border-color": "#333",
      "--header-background-color": "#333",
      "--header-text-color": "#fff",
      "--header-border-color": "#ddd",
      "--row-even-background-color": "#8a8a8a",
      "--row-odd-background-color": "#636363",
      "--footer-background-color": "#555",
      "--footer-text-color": "#fff",
      "--edit-box-color": "#1D68CD",
      "--error-color": "#dd0000",
    },
    groupProperties: {
      "--row-even-background-color": "#636363",
      "--row-odd-background-color": "#636363",
    },
    rules: [],
  },
  basic: {
    properties: {
      "--background-color": "#fff",
      "--border-color": "#999",
      "--header-background-color": "#fff",
      "--header-text-color": "#333",
      "--row-even-background-color": "#fff",
      "--row-odd-background-color": "#fff",
      "--footer-background-color": "#fff",
      "--footer-text-color": "#333",
      "--edit-box-color": "#1D68CD",
      "--error-color": "#dd0000",
    },
    groupProperties: {},
    rules: [],
  },
  modern: {
    properties: {
      "--background-color": "#fff",
      "--border-color": "#999",
      "--header-background-color": "#fff",
      "--header-text-color": "#1254b7",
      "--row-even-background-color": "#fcfcfc",
      "--row-odd-background-color": "#fff",
      "--footer-background-color": "#fff",
      "--footer-text-color": "#1254b7",
      "--edit-box-color": "#1D68CD",
      "--error-color": "#dd0000",
    },
    groupProperties: {
      "--row-even-background-color": "#fff",
      "--row-odd-background-color": "#fff",
    },
    rules: [
      ".tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-left {border-left: 10px solid #3759d7}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row .tabulator-cell {padding: 6px 4px;}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row {margin-bottom: 2px; border: 1px solid #fff}",
      ".tabulator .tabulator-header .tabulator-col .tabulator-col-content {padding-right: 25px}",
      ".tabulator .tabulator-header {border-bottom: 3px solid var(--header-separator-color, #999);}",
    ],
  },
  default: {
    properties: {},
    groupProperties: {
      "--row-even-background-color": "#fff",
      "--row-odd-background-color": "#fff",
    },
    rules: [
      ".tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-left {border-left: 10px solid #3759d7}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row .tabulator-cell {padding: 6px 4px;}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row {margin-bottom: 2px; border: 1px solid #fff}",
      ".tabulator .tabulator-header .tabulator-col .tabulator-col-content {padding-right: 25px}",
      ".tabulator .tabulator-header {border-bottom: 3px solid var(--header-separator-color, #999);}",
    ],
  },
};

const tableSpacingValues = {
  small: "4px",
  medium: "8px",
  large: "12px"
};

const insertRule = (sheet, rule) => {
  if (sheet?.insertRule) {
    sheet.insertRule(rule, sheet.cssRules.length);
  }
};

const applyCSSVariables = (properties) => {
  const root = document.documentElement;
  Object.entries(properties).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

const setCSSVariable = (variableName, value) => {
  const root = document.documentElement;
  root.style.setProperty(variableName, value);
};

export const setVisualizationTheme = ({ theme, tableSpacing, initialColumnBorders }, groupRows) => {
  const sheet = document.styleSheets[0];
  const themeOption = themePresets[theme?.toLowerCase()] || themePresets.default;

  applyCSSVariables(themeOption.properties);

  if (groupRows) {
    applyCSSVariables(themeOption.groupProperties);
  }

  setCSSVariable({"--table-spacing": tableSpacingValues[tableSpacing] || tableSpacingValues.small});

  themeOption.rules.forEach(rule => insertRule(sheet, rule));

  if (initialColumnBorders && themeOption.initialColumnBorders) {
    Object.values(themeOption.initialColumnBorders).forEach(rule => insertRule(sheet, rule));
  }
};

export const setTextWrapping = () => {
  const sheet = document.styleSheets[0];
  [
    ".tabulator-row .tabulator-cell {white-space: normal !important; word-break: break-word}",
    ".tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title {white-space: normal !important; word-break: break-word}",
  ].forEach(rule => insertRule(sheet, rule));
};
