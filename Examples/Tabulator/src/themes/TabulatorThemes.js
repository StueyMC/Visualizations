// TODO: Add comments

const themePresets = {
  midnight: {
    properties: {
      "--bg-color": "#333",
      "--border-color": "#333",
      "--header-bg": "#333",
      "--header-text": "#fff",
      "--header-border": "#ddd",
      "--header-separator": "#ddd",
      "--header-hover-bg": "#ddd",
      "--header-hover-text": "#ddd",
      "--header-range-selected-bg": "#ddd",
      "--header-range-selected-text": "#ddd",
      "--header-sort-icon-active": "#ddd",
      "--header-sort-icon-inactive": "#ddd",
      "--header-filter-icon": "#ddd",
      "--row-bg-even": "#8a8a8a",
      "--row-bg-odd": "#636363",
      "--row-text-even": "#ddd",
      "--row-text-odd": "#ddd",
      "--row-border": "#ddd",
      "--row-hover-bg": "#ddd",
      "--row-selected-bg": "#ddd",
      "--row-calc-bg": "#000",
      "--row-group-bg": "#ddd",
      "--row-group-text": "#ddd",
      "--row-group-item-count-text": "#ddd",
      "--footer-bg": "#555",
      "--footer-text": "#eee",
      "--footer-active-text": "#ddd",
      "--edit-box": "#1D68CD",
    },
    rules: [],
  },
  basic: {
    properties: {
      "--bg-color": "#333",
      "--border-color": "#333",
      "--header-bg": "#333",
      "--header-text": "#fff",
      "--header-border": "#ddd",
      "--header-separator": "#ddd",
      "--header-hover-bg": "#ddd",
      "--header-hover-text": "#ddd",
      "--header-range-selected-bg": "#ddd",
      "--header-range-selected-text": "#ddd",
      "--header-sort-icon-active": "#ddd",
      "--header-sort-icon-inactive": "#ddd",
      "--header-filter-icon": "#ddd",
      "--row-bg-even": "#8a8a8a",
      "--row-bg-odd": "#636363",
      "--row-text-even": "#ddd",
      "--row-text-odd": "#ddd",
      "--row-border": "#ddd",
      "--row-hover-bg": "#ddd",
      "--row-selected-bg": "#ddd",
      "--row-calc-bg": "#000",
      "--row-group-bg": "#ddd",
      "--row-group-text": "#ddd",
      "--row-group-item-count-text": "#ddd",
      "--footer-bg": "#555",
      "--footer-text": "#eee",
      "--footer-active-text": "#ddd",
      "--edit-box": "#1D68CD",
    },
    rules: [],
  },
  modern: {
    properties: {
      "--bg-color": "#333",
      "--border-color": "#333",
      "--header-bg": "#333",
      "--header-text": "#fff",
      "--header-border": "#ddd",
      "--header-separator": "#ddd",
      "--header-hover-bg": "#ddd",
      "--header-hover-text": "#ddd",
      "--header-range-selected-bg": "#ddd",
      "--header-range-selected-text": "#ddd",
      "--header-sort-icon-active": "#ddd",
      "--header-sort-icon-inactive": "#ddd",
      "--header-filter-icon": "#ddd",
      "--row-bg-even": "#8a8a8a",
      "--row-bg-odd": "#636363",
      "--row-text-even": "#ddd",
      "--row-text-odd": "#ddd",
      "--row-border": "#ddd",
      "--row-hover-bg": "#ddd",
      "--row-selected-bg": "#ddd",
      "--row-calc-bg": "#000",
      "--row-group-bg": "#ddd",
      "--row-group-text": "#ddd",
      "--row-group-item-count-text": "#ddd",
      "--footer-bg": "#555",
      "--footer-text": "#eee",
      "--footer-active-text": "#ddd",
      "--edit-box": "#1D68CD",
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

export const setVisualizationTheme = ({ theme, tableSpacing, initialColumnBorders }) => {
  const sheet = document.styleSheets[0];
  const themeOption = themePresets[theme?.toLowerCase()] || themePresets.default;

  applyCSSVariables(themeOption.properties);

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
