const themeOptions = {
  midnight: {
    properties: {
      /*Main Theme Variables*/
      "--background-color": "#333",
      "--border-color": "#333",

      /*header theming*/
      "--header-background-color": "#333",
      "--header-col-background-color": "#333",
      "--header-col-range-highlight-background-color": "999",
      "--header-col-range-selected-background-color": "ccc",
      "--header-col-range-selected-color": "fff",
      "--header-text-color": "#fff",
      "--headerBorderColor": "#ddd",
      "--headerSeparatorColor": "#999",

      /*footer theming*/
      "--footer-background-color": "#555",
      "--footer-text-color": "#fff",
      "--footer-page-color": "hsla(0, 0%, 100%, .2)",
      "--footer-active-page-color": "#fff",

      /*column header arrows*/
      "--sortArrowActive": "#666",
      "--sortArrowInactive": "#bbb",

      /*row theming*/
      "--rowBackgroundColor": "#8a8a8a",
      "--rowAltBackgroundColor": "#636363",
      "--rowBorderColor": "#ddd",
      "--rowTextColor": "#FFF",
      "--rowAltTextColor": "#FFF",
      "--rowHoverBackground": "#bbb",
      "--rowSelectedBackground": "#9ABCEA",

      "--editBoxColor": "#1D68CD",
      "--errorColor": "#dd0000",

      "--rowGroupBackground": "#444",
      "--rowGroupText": "#fff",
      "--rowGroupItemCountText": "#fff",
    },
    rules: [],
    groupProperties: {
      "--rowBackgroundColor": "#636363",
      "--rowAltBackgroundColor": "#636363",
    },
  },
  simple: {
    properties: {
      /*Main Theme Variables*/
      "--background-color": "#fff",
      "--border-color": "#999",

      /*header theming*/
      "--header-background-color": "#fff",
      "--header-col-background-color": "#fff",
      "--header-col-range-highlight-background-color": "#d6d6d6",
      "--header-col-range-selected-background-color": "#3876ca",
      "--header-col-range-selected-color": "#fff",
      "--header-text-color": "#333",
      "--headerBorderColor": "#ddd",
      "--headerSeparatorColor": "#999",

      /*footer theming*/
      "--footer-background-color": "#fff",
      "--footer-text-color": "#333",
      "--footer-page-color": "hsla(0, 0%, 100%, .2)",
      "--footer-active-page-color": "#d00",

      /*column header arrows*/
      "--sortArrowActive": "#666",
      "--sortArrowInactive": "#bbb",

      /*row theming*/
      "--rowBackgroundColor": "#fff",
      "--rowAltBackgroundColor": "#fff",
      "--rowBorderColor": "#ddd",
      "--rowTextColor": "#000",
      "--rowAltTextColor": "#333",
      "--rowHoverBackground": "#bbb",
      "--rowSelectedBackground": "#9ABCEA",

      "--editBoxColor": "#1D68CD",
      "--errorColor": "#dd0000",

      "--rowGroupBackground": "#eee",
      "--rowGroupText": "#000",
      "--rowGroupItemCountText": "#000",
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

      /*header theming*/
      "--header-background-color": "#fff",
      "--header-col-background-color": "#fff",
      "--header-col-range-highlight-background-color": "#d6d6d6",
      "--header-col-range-selected-background-color": "#3876ca",
      "--header-col-range-selected-color": "#fff",
      "--header-text-color": "#1254b7",
      "--headerBorderColor": "#fff",
      "--headerSeparatorColor": "#2544b7",

      /*footer theming*/
      "--footer-background-color": "#fff",
      "--footer-text-color": "#1254b7",
      "--footer-page-color": "hsla(0, 0%, 100%, .2)",
      "--footer-active-page-color": "#d00",

      /*column header arrows*/
      "--sortArrowActive": "#666",
      "--sortArrowInactive": "#bbb",

      /*row theming*/
      "--rowBackgroundColor": "#fcfcfc",
      "--rowAltBackgroundColor": "#fff",
      "--rowBorderColor": "#fff",
      "--rowTextColor": "#000",
      "--rowAltTextColor": "#333",
      "--rowHoverBackground": "#bbb",
      "--rowSelectedBackground": "#9ABCEA",

      "--editBoxColor": "#1D68CD",
      "--errorColor": "#d00",

      "--rowGroupBackground": "#f2f2f2",
      "--rowGroupText": "#000",
      "--rowGroupItemCountText": "#000",
    },
    rules: [
      ".tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-left {border-left: 10px solid #3759d7}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row .tabulator-cell {padding: 6px 4px;}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row {margin-bottom: 2px; border: 1px solid #fff}",
      ".tabulator .tabulator-header .tabulator-col .tabulator-col-content {padding-right: 25px}",
      ".tabulator .tabulator-header {border-bottom: 3px solid var(--headerSeparatorColor, #999);}",
    ],
    groupProperties: {
      "--rowBackgroundColor": "#fff",
      "--rowAltBackgroundColor": "#fff",
    },
  },
};

const wrapTextCSS = [
  ".tabulator-row .tabulator-cell {white-space: normal !important; word-break: break-word}",
  ".tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title {white-space: normal !important; word-break: break-word}",
];

export const setVisualizationTheme = (theme, groupRows) => {
  const root = document.querySelector(":root");

  if (!theme) {
    if (groupRows) {
      const defaultGroupProperties = {
        "--rowBackgroundColor": "#fff",
        "--rowAltBackgroundColor": "#fff",
      };

      Object.entries(defaultGroupProperties).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    return;
  }

  const themeLower = theme.toLowerCase();
  const themeOption = themeOptions[themeLower];

  if (themeOption) {
    const myStyleSheet = document.styleSheets[0];

    Object.entries(themeOption.rules).forEach(([key, value]) => {
      myStyleSheet.insertRule(
        value,
        myStyleSheet.cssRules.length
      );
    });

    Object.entries(themeOption.properties).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    if (groupRows && themeOption.groupProperties) {
      Object.entries(themeOption.groupProperties).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }
};

export const setTextWrapping = () => {
  const myStyleSheet = document.styleSheets[0];
  wrapTextCSS.forEach((rule) => {
    myStyleSheet.insertRule(rule, myStyleSheet.cssRules.length);
  });
};
