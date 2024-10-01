import { TabulatorFull as Tabulator } from "tabulator-tables";
import {
  setVisualizationTheme,
  setTextWrapping,
} from "../visualizationThemes/visualizationThemes.js";
import { getFormat, formatDate } from "../formatters/formatters.js";
import { getEditorType } from "../formatters/editors.js";

function getAlignment(alignment) {
  return alignment === "center" || alignment == "right" ? alignment : "left";
}

function getColumns(config, columns) {
  let columnDefinition = [];
  columns.forEach((column) => {
    let newColumn = {
      title: column.title,
      field: column.title,
      width: column.width,
      headerHozAlign: getAlignment(column.alignment),
      frozen: column.frozen,
      headerSort: config.data.columnSorting ? column.columnSorter : false,
      resizable: config.data.resizable && column.resizable,
      editor:
        config.data.editable && column.editable
          ? getEditorType(column.format) || true
          : false,
      headerFilter:
        config.data.headerFiltering && column.headerFilter ? "input" : null,
      // cellClick: function (e, cell) {
      //   config.functions.performAction("Cell Click", cell.getInitialValue, e);
      // },
      formatter:
        getFormat[column.format] ||
        (column.format && column.format.includes("%")
          ? (cell) => formatDate(cell, column.format)
          : column.format),
    };

    columnDefinition.push(newColumn);
  });

  return columnDefinition;
}

function getGroupHeader(data) {
  return data.groupBy || "Other";
}

function headerMenu(group, table) {
  let menu = [];

  if (group.columns.length > 1) {
    let checkmarkContainer = document.createElement("i");
    let checkmarkBoxIcon = document.createElement("i");
    let checkmarkTickIcon = document.createElement("i");

    checkmarkContainer.classList.add("icon--container");
    checkmarkBoxIcon.classList.add("icon--checkmark-box", "checked");
    checkmarkTickIcon.classList.add("ticked");

    let label = document.createElement("span");
    let collapseTitle = document.createElement("span");
    let expandTitle = document.createElement("span");

    expandTitle.classList.add("header-button", "hidden");
    collapseTitle.classList.add("header-button");

    expandTitle.textContent = " Expand";
    collapseTitle.textContent = " Collapse";

    function updateHeaderMenu() {
      checkmarkBoxIcon.classList.toggle("checked");
      checkmarkTickIcon.classList.toggle("ticked");
      expandTitle.classList.toggle("hidden");
      collapseTitle.classList.toggle("hidden");
    }

    label.appendChild(checkmarkContainer);
    checkmarkContainer.appendChild(checkmarkBoxIcon);
    checkmarkBoxIcon.appendChild(checkmarkTickIcon);
    label.appendChild(collapseTitle);
    label.appendChild(expandTitle);

    //create menu item
    menu.push({
      label: label,
      action: function () {
        let columnsToToggle = {};
        for (var i = 0; i < group.columns.length; i++) {
          if (i !== 0) {
            columnsToToggle[group.columns[i].title] = true;
          }
        }

        //toggle current column visibility
        table.getColumns().forEach((column) => {
          if (columnsToToggle[column.getField()]) {
            column.toggle();
          }
        });

        updateHeaderMenu();

        table.redraw();
      },
    });
  }

  return menu.length ? menu : null;
}

export function createColumnDefinition(config, rows, table) {
  let columnDefinition = [];

  if (rows[0].columns) {
    columnDefinition.push(...getColumns(config, rows[0].columns));
  }

  if (rows[0].groups) {
    rows[0].groups.forEach((group) => {
      let newColumns = [];

      if (group.columns) {
        newColumns.push(...getColumns(config, group.columns));
      }

      if (group.subGroups) {
        group.subGroups.forEach((subGroup) => {
          if (subGroup.columns) {
            let newSubGroup = {
              title: subGroup.title,
              columns: getColumns(config, subGroup.columns),
              headerMenu: headerMenu(subGroup, table),
            };
            newColumns.push(newSubGroup);
          }
        });
      }

      let newGroup = {
        title: group.title,
        columns: newColumns,
        headerMenu: headerMenu(group, table),
      };

      columnDefinition.push(newGroup);
    });
  }

  return columnDefinition;
}

export function visualization(config) {
  const configData = config.data;
  const mainElement = document.getElementById(config.element);
  const tabulatorDiv = document.createElement("div");

  setVisualizationTheme(configData.theme, configData.rows[0].groupRows);

  if (configData.textWrap) {
    setTextWrapping();
  }

  var table = new Tabulator(tabulatorDiv, {
    height: "350px",
    data: transformJson(configData.rows),
    layout: "fitColumns",
    movableColumns: true,
    resizableRows: true,
    headerSortClickElement: "icon",

    //enable range selection
    selectableRange: 1,
    selectableRangeColumns: true,
    selectableRangeRows: true,
    selectableRangeClearCells: true,

    //change edit trigger mode to make cell navigation smoother
    editTriggerEvent: "dblclick",

    //configure clipboard to allow copy and paste of range format data
    clipboard: true,
    clipboardCopyStyled: true,
    clipboardCopyRowRange: "range",
    clipboardPasteParser: "range",
    clipboardPasteAction: "range",

    columns: createColumnDefinition(config, configData.rows, table),

    ...(configData.rows[0].groupRows
      ? {
          groupBy: getGroupHeader,
          groupHeader: function (value, count) {
            return value + "<span>(" + count + " items)</span>";
          },
        }
      : {}),
  });

  mainElement.appendChild(tabulatorDiv);
}

export function transformJson(rows) {
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
      Object.assign(dataRow, dataObject);
    }
    if (row.groups) {
      row.groups.forEach((group) => {
        if (group.columns) {
          let dataObject = setRow(group.columns);
          Object.assign(dataRow, dataObject);
        }
        if (group.subGroups) {
          group.subGroups.forEach((subGroup) => {
            if (subGroup.columns) {
              let dataObject = setRow(subGroup.columns);
              Object.assign(dataRow, dataObject);
            }
          });
        }
      });
    }
    if (row.groupBy) {
      dataRow["groupBy"] = row.groupBy;
    }
    newData.push(dataRow);
  });

  return JSON.parse(JSON.stringify(newData));
}
