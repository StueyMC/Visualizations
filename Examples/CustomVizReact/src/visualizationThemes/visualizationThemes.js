const themeOptions = {
  midnight: {
    properties: {
      /* Main Theme Variables */
      "--background-color": "#333",
      "--border-color": "#333",

      /* Header Theming */
      "--header-background-color": "#333",
      "--header-text-color": "#fff",
      "--header-border-color": "#ddd",
      "--header-separator-color": "#999" /* header bottom separator color */,
      "--header-margin": "4px" /* padding round header */,

      "--header-col-background-color": "#333",
      "--header-col-hover-background-color": "#999",
      "--header-col-hover-text-color": "#fff",
      "--header-col-range-selected-background-color": "#ccc",
      "--header-col-range-selected-color": "#fff",

      "--header-sort-icon-active": "#666",
      "--header-sort-icon-inactive": "#bbb",

      /* Row Theming */
      "--row-border-color": "#ddd",
      "--row-hover-background": "#bbb" /* row background color on hover */,
      "--row-selected-background":
        "#9ABCEA" /* row background color when selected */,

      "--row-even-background-color": "#8a8a8a",
      "--row-even-text-color": "#fff",

      "--row-odd-background-color": "#636363",
      "--row-odd-text-color": "#fff",

      "--row-group-background": "#444",
      "--row-group-text": "#fff",
      "--row-group-item-count-text": "#fff",

      /* Footer Theming */
      "--footer-background-color": "#555",
      "--footer-text-color": "#fff",
      "--footer-page-color": "hsla(0, 0%, 100%, .2)",
      "--footer-active-page-color": "#fff",

      "--edit-box-color": "#1D68CD" /* border color for edit boxes */,
      "--error-color": "#dd0000" /* error indication */,
    },
    rules: [],
    groupProperties: {
      "--row-even-background-color": "#636363",
      "--row-odd-background-color": "#636363",
    },
  },
  simple: {
    properties: {
      /*Main Theme Variables*/
      "--background-color": "#fff",
      "--border-color": "#999",

      /* Header Theming */
      "--header-background-color": "#fff",
      "--header-text-color": "#333",
      "--header-border-color": "#ddd",
      "--header-separator-color": "#999",
      "--header-margin": "4px",

      "--header-col-background-color": "#fff",
      "--header-col-hover-background-color": "#d6d6d6",
      "--header-col-range-selected-background-color": "#3876ca",
      "--header-col-range-selected-color": "#fff",

      "--header-sort-icon-active": "#666",
      "--header-sort-icon-inactive": "#bbb",

      /* Row Theming */
      "--row-border-color": "#ddd",
      "--row-hover-background": "#bbb",
      "--row-selected-background": "#9ABCEA",

      "--row-even-background-color": "#fff",
      "--row-even-text-color": "#000",

      "--row-odd-background-color": "#fff",
      "--row-odd-text-color": "#333",

      "--row-group-background": "#eee",
      "--row-group-text": "#000",
      "--row-group-item-count-text": "#000",

      /* Footer Theming */
      "--footer-background-color": "#fff",
      "--footer-text-color": "#333",
      "--footer-page-color": "hsla(0, 0%, 100%, .2)",
      "--footer-active-page-color": "#d00",

      "--edit-box-color": "#1D68CD",
      "--error-color": "#dd0000",
    },
    rules: [],
    groupProperties: [],
  },
  modern: {
    properties: {
      /*Main Theme Variables*/
      "--background-color": "#fff",
      "--border-color": "#999",
      "--text-size": "16px",

      /* Header Theming */
      "--header-background-color": "#fff",
      "--header-text-color": "#1254b7",
      "--header-border-color": "#fff",
      "--header-separator-color": "#2544b7",
      "--header-margin": "4px",

      "--header-col-background-color": "#fff",
      "--header-col-hover-background-color": "#ccc",
      "--header-col-hover-text-color": "#0034a2",
      "--header-col-range-selected-background-color": "#3876ca",
      "--header-col-range-selected-color": "#fff",

      "--header-sort-icon-active": "#666",
      "--header-sort-icon-inactive": "#bbb",

      /* Row Theming */
      "--row-border-color": "#fff",
      "--row-hover-background": "#ccc",
      "--row-selected-background": "#9ABCEA",

      "--row-even-background-color": "#fcfcfc",
      "--row-even-text-color": "#000",

      "--row-odd-background-color": "#fff",
      "--row-odd-text-color": "#333",

      "--row-group-background": "#f2f2f2",
      "--row-group-text": "#000",
      "--row-group-item-count-text": "#000",

      /* Footer Theming */
      "--footer-background-color": "#fff",
      "--footer-text-color": "#1254b7",
      "--footer-page-color": "hsla(0, 0%, 100%, .2)",
      "--footer-active-page-color": "#d00",

      "--edit-box-color": "#1D68CD",
      "--error-color": "#dd0000",
    },
    rules: [
      ".tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-left {border-left: 10px solid #3759d7}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row .tabulator-cell {padding: 6px 4px;}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row {margin-bottom: 2px; border: 1px solid #fff}",
      ".tabulator .tabulator-header .tabulator-col .tabulator-col-content {padding-right: 25px}",
      ".tabulator .tabulator-header {border-bottom: 3px solid var(--header-separator-color, #999);}",
    ],
    groupProperties: {
      "--row-even-background-color": "#fff",
      "--row-odd-background-color": "#fff",
    },
  },
};

const textWrapCSS = [
  ".tabulator-row .tabulator-cell {white-space: normal !important; word-break: break-word}",
  ".tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title {white-space: normal !important; word-break: break-word}",
];

const insertRuleIntoStyleSheet = (sheet, rule) => {
  if (sheet && sheet.insertRule) {
    sheet.insertRule(rule, sheet.cssRules.length);
  }
};

const setCSSVariable = (variableName, value) => {
  const root = document.documentElement;
  root.style.setProperty(variableName, value);
};

export const setVisualizationTheme = (theme, groupRows) => {
  const sheet = document.styleSheets[0]
  const themeLower = theme ? theme.toLowerCase() : undefined;
  const themeOption = themeLower && themeOptions[themeLower];

  if (!themeOption) {
    if (groupRows) {
      setCSSVariable("--row-odd-background-color", "#fff");
      setCSSVariable("--row-even-background-color", "#fff");
    }
    return;
  }

  if (themeOption) {
    Object.entries(themeOption.rules).forEach(([_key, value]) => {
      insertRuleIntoStyleSheet(sheet, value);
    });

    Object.entries(themeOption.properties).forEach(([key, value]) => {
      setCSSVariable(key, value);
    });

    if (groupRows && themeOption.groupProperties) {
      Object.entries(themeOption.groupProperties).forEach(([key, value]) => {
        setCSSVariable(key, value);
      });
    }
  }
};

export const setTextWrapping = () => {
  const myStyleSheet = document.styleSheets[0];
  textWrapCSS.forEach((rule) => {
    myStyleSheet.insertRule(rule, myStyleSheet.cssRules.length);
  });
};
