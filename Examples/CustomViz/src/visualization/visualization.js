import { TabulatorFull as Tabulator } from "tabulator-tables";
import {
  setVisualizationTheme,
  setTextWrapping,
} from "../visualizationThemes/visualizationThemes.js";
import { getFormat, formatDate } from "../formatters/formatters.js";
import { getEditorType } from "../formatters/editors.js";

function headerMenu(group) {
  let menu = [];

  if (group.columns.length > 1) {
    //create checkbox element using font awesome icons
    let checkmarkContainer = document.createElement("i");
    let checkmarkBoxIcon = document.createElement("i");
    let checkmarkTickIcon = document.createElement("i");

    checkmarkContainer.classList.add("icon--container");
    checkmarkBoxIcon.classList.add("icon--checkmark-box-checked");
    checkmarkTickIcon.classList.add("icon--checkmark-tick");

    //build label
    let label = document.createElement("span");
    let title = document.createElement("span");
    title.classList.add("icon--title");
    title.textContent = " Expanded";

    label.appendChild(checkmarkContainer);
    checkmarkContainer.appendChild(checkmarkBoxIcon);
    checkmarkBoxIcon.appendChild(checkmarkTickIcon);
    label.appendChild(title);

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

        if (
          checkmarkBoxIcon.classList.contains("icon--checkmark-box-checked")
        ) {
          checkmarkBoxIcon.classList.remove("icon--checkmark-box-checked");
          checkmarkTickIcon.classList.remove("icon--checkmark-tick");
          checkmarkBoxIcon.classList.add("icon--checkmark-box");
          checkmarkTickIcon.classList.add("icon--checkmark-tick-hidden");
        } else {
          checkmarkBoxIcon.classList.remove("icon--checkmark-box");
          checkmarkTickIcon.classList.remove("icon--checkmark-tick-hidden");
          checkmarkBoxIcon.classList.add("icon--checkmark-box-checked");
          checkmarkTickIcon.classList.add("icon--checkmark-tick");
        }

        table.redraw();
      },
    });

    return menu;
  }
  return;
}

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

export function createColumnDefinition(config, rows) {
  let columnDefinition = [];

  if (rows[0].columns) {
    getColumns(config, rows[0].columns).forEach((column) => {
      columnDefinition.push(column);
    });
  }

  if (rows[0].groups) {
    rows[0].groups.forEach((group) => {
      let newColumns = [];

      if (group.columns) {
        getColumns(config, group.columns).forEach((column) => {
          newColumns.push(column);
        });
      }

      if (group.subGroups) {
        group.subGroups.forEach((subGroup) => {
          if (subGroup.columns) {
            let newSubGroup = {
              title: subGroup.title,
              columns: getColumns(config, subGroup.columns),
              headerMenu: headerMenu(subGroup),
            };
            newColumns.push(newSubGroup);
          }
        });
      }

      let newGroup = {
        title: group.title,
        columns: newColumns,
        headerMenu: headerMenu(group),
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

  function getGroupHeader(data) {
    return data.groupBy || "Other";
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

    columns: createColumnDefinition(config, configData.rows),

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
      for (const property in dataObject) {
        dataRow[property] = dataObject[property];
      }
    }
    if (row.groups) {
      row.groups.forEach((group) => {
        if (group.columns) {
          let dataObject = setRow(group.columns);
          for (const property in dataObject) {
            dataRow[property] = dataObject[property];
          }
        }
        if (group.subGroups) {
          group.subGroups.forEach((subGroup) => {
            if (subGroup.columns) {
              let dataObject = setRow(subGroup.columns);
              for (const property in dataObject) {
                dataRow[property] = dataObject[property];
              }
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
