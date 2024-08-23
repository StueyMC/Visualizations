const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const styleOptions = {
  midnight: {
    properties: {
      /*Main Theme Variables*/
      "--background-color": "#333",
      "--border-color": "#333",

      /*header theming*/
      "--header-background-color": "#333",
      "--header-col-background-color": "#434343",
      "--header-col-range-highlight-background-color": "999",
      "--header-col-range-selected-background-color": "ccc",
      "--header-col-range-selected-color": "333",
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
      "--rowHoverBackground": "#bbb",
      "--rowSelectedBackground": "#9ABCEA",
      "--rowSelectedBackgroundHover": "#769BCC",

      "--editBoxColor": "#1D68CD",
      "--errorColor": "#dd0000",
    },
    rules: [],
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
      "--rowTextColor": "#333",
      "--rowHoverBackground": "#bbb",
      "--rowSelectedBackground": "#9ABCEA",
      "--rowSelectedBackgroundHover": "#769BCC",

      "--editBoxColor": "#1D68CD",
      "--errorColor": "#dd0000",
    },
    rules: [],
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
      "--rowBackgroundColor": "#f3f3f3",
      "--rowAltBackgroundColor": "#fff",
      "--rowBorderColor": "#fff",
      "--rowTextColor": "#333",
      "--rowHoverBackground": "#bbb",
      "--rowSelectedBackground": "#9ABCEA",
      "--rowSelectedBackgroundHover": "#769BCC",

      "--editBoxColor": "#1D68CD",
      "--errorColor": "#dd0000",
    },
    rules: [
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row .tabulator-cell:first-child {border-left:10px solid #3759d7;}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row:nth-child(2n) .tabulator-cell:first-child{border-left:10px solid #627ce0;}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row .tabulator-cell {padding: 6px 4px;}",
      ".tabulator .tabulator-tableholder .tabulator-table .tabulator-row {margin-bottom: 2px; border: 1px solid #fff}",
      ".tabulator .tabulator-header .tabulator-col .tabulator-col-content {padding-right: 25px}",
      ".tabulator .tabulator-header {border-bottom: 3px solid var(--headerSeparatorColor, #999);}",
    ],
  },
};

function isDateValid(dateStr) {
  return !isNaN(new Date(dateStr));
}

function formatDate(cell, format) {
  if (isDateValid(cell.getValue())) {
    const d = new Date(cell.getValue());
    const fullYear = d.getFullYear().toString();
    const yearShort = fullYear.slice(-2);
    const fullMonth = months[d.getMonth()];
    const monthShort = monthsShort[d.getMonth()];
    const month = (d.getMonth() + 1).toString().padStart("2", 0);
    const fullDay = days[d.getDay()];
    const dayShort = daysShort[d.getDay()];
    const date = d.getDate().toString().padStart("2", 0);
    const hours = d.getHours().toString().padStart("2", 0);
    const hour = d.getHours().toString();
    const minutes = d.getMinutes().toString().padStart("2", 0);
    const seconds = d.getSeconds().toString().padStart("2", 0);
    const milliseconds = d.getMilliseconds().toString();
    const terrestrialTime = hours >= 12 ? "PM" : "AM";

    const formattedDate = format
      .replace("%ms", milliseconds)
      .replace("%ss", seconds)
      .replace("%mm", minutes)
      .replace("%HH", hours)
      .replace("%hh", hours)
      .replace("%H", hour)
      .replace("%h", hour)
      .replace("%dddd", fullDay)
      .replace("%ddd", dayShort)
      .replace("%dd", date)
      .replace("%MMMM", fullMonth)
      .replace("%MMM", monthShort)
      .replace("%MM", month)
      .replace("%yyyy", fullYear)
      .replace("%yy", yearShort)
      .replace("%tt", terrestrialTime);

    return formattedDate;
  }
}

const formatters = {
  datetime: function (cell) {
    if (isDateValid(cell.getValue())) {
      const d = new Date(cell.getValue());
      const dateString = d.toDateString() + ", " + d.toLocaleTimeString();
      return dateString;
    }
  },

  date: function (cell) {
    if (isDateValid(cell.getValue())) {
      const d = new Date(cell.getValue());
      const dateString = d.toLocaleDateString();
      return dateString;
    }
  },

  time: function (cell) {
    if (isDateValid(cell.getValue())) {
      const d = new Date(cell.getValue());
      const dateString = d.toLocaleTimeString();
      return dateString;
    }
  },
};

function setVisualizerStyle(colorOption) {
  if (colorOption && styleOptions[colorOption.toLowerCase()]) {
    let root = document.querySelector(":root");
    let myStyleSheet = document.styleSheets[0];
    let styleOption = styleOptions[colorOption.toLowerCase()];

    for (let key in styleOption.rules) {
      myStyleSheet.insertRule(
        styleOption.rules[key],
        myStyleSheet.cssRules.length
      );
    }

    for (let key in styleOption.properties) {
      root.style.setProperty(key, styleOption.properties[key]);
    }
  }
}

function createVisualization(config, css) {
  var elem = document.getElementById(config.element);

  var testDiv = document.createElement("div");

  setVisualizerStyle(config.data.colorOption);

  function headerMenu(columnGroup) {
    var menu = [];

    if (columnGroup.columns.length > 1) {
      //create checkbox element using font awesome icons
      let icon = document.createElement("i");
      icon.classList.add("ph--check-square-fill");

      //build label
      let label = document.createElement("span");
      let title = document.createElement("span");

      title.textContent = " Expanded";

      label.appendChild(icon);
      label.appendChild(title);

      //create menu item
      menu.push({
        label: label,
        action: function (e) {
          let columnsToToggle = {};
          for (var i = 0; i < columnGroup.columns.length; i++) {
            if (i !== 0) {
              columnsToToggle[columnGroup.columns[i].title] = true;
            }
          }

          //toggle current column visibility
          table.getColumns().forEach((column) => {
            if (columnsToToggle[column.getField()]) {
              column.toggle();
            }
          });

          if (icon.classList.contains("ph--check-square-fill")) {
            icon.classList.remove("ph--check-square-fill");
            icon.classList.add("ph--square-bold");
          } else {
            icon.classList.remove("ph--square-bold");
            icon.classList.add("ph--check-square-fill");
          }

          table.redraw();
        },
      });

      return menu;
    }
    return;
  }

  function getColumns(config, columns) {
    let columnDefinition = [];
    columns.forEach((column) => {
      let newColumn = {
        title: column.title,
        field: column.title,
        editor: column.editable,
        headerFilter: "input",
        cellClick: function (e, cell) {
          console.log(cell);
          config.functions.performAction("Cell Click", cell.getInitialValue, e);
        },
        formatter:
          formatters[column.format] ||
          (column.format && column.format.includes("%")
            ? (cell) => formatDate(cell, column.format)
            : column.format),
      };

      columnDefinition.push(newColumn);
    });
    return columnDefinition;
  }

  function createColumnDefinition(config, rows) {
    let columnDefinition = [];
    if (rows[0].columns) {
      getColumns(config, rows[0].columns).forEach((column) => {
        columnDefinition.push(column);
      });
    }
    if (rows[0].columnGroups) {
      rows[0].columnGroups.forEach((columnGroup) => {
        if (columnGroup.columns) {
          let newColumnGroup = {
            title: columnGroup.title,
            columns: getColumns(config, columnGroup.columns),
            headerMenu: headerMenu(columnGroup),
          };
          columnDefinition.push(newColumnGroup);
        } else {
          console.warn(
            "The '" + columnGroup.title + "' column group has no columns."
          );
        }
      });
    }
    return columnDefinition;
  }

  var table = new Tabulator(testDiv, {
    data: transformJson(config.data.rows),
    layout: "fitColumns",
    pagination: true,
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 30, true],
    movableColumns: true,
    columns: createColumnDefinition(config, config.data.rows),
  });

  elem.appendChild(testDiv);
}

function transformJson(rows) {
  let newData = [];

  function setRow(columns) {
    let newDataRow = {};
    columns.forEach((column) => {
      newDataRow[column.title] = column.content;
    });
    return newDataRow;
  }

  rows.forEach((row) => {
    let dataRow = {};
    if (row.columns) {
      let dataObject = setRow(row.columns);
      for (const property in dataObject) {
        dataRow[property] = dataObject[property];
      }
    }
    if (row.columnGroups) {
      row.columnGroups.forEach((columnGroup) => {
        if (columnGroup.columns) {
          let dataObject = setRow(columnGroup.columns);
          for (const property in dataObject) {
            dataRow[property] = dataObject[property];
          }
        }
      });
    }
    newData.push(dataRow);
  });

  return JSON.parse(JSON.stringify(newData));
}
