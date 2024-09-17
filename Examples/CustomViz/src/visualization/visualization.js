import { TabulatorFull as Tabulator } from "tabulator-tables";
import {
  setVisualizationTheme,
  setTextWrapping,
} from "../visualizationThemes/visualizationThemes.js";
import { getFormat, formatDate } from "../formatters/formatters.js";
import { getEditorType } from "../formatters/editors.js";

export function visualization(config) {
  const configData = config.data;
  const mainElement = document.getElementById(config.element);
  const tabulatorDiv = document.createElement("div");

  setVisualizationTheme(configData.themeOption, configData.groupRows);

  if (configData.wrapText) {
    setTextWrapping();
  }

  function headerMenu(columnGroup) {
    let menu = [];

    if (columnGroup.columns.length > 1) {
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

  function getColumns(_config, columns) {
    let columnDefinition = [];
    columns.forEach((column) => {
      let newColumn = {
        title: column.title,
        field: column.title,
        width: column.width,
        frozen: column.frozen,
        headerSort: column.headerSort,
        resizable: column.resizable,
        editor: column.editable ? getEditorType(column.format) || true : false,
        headerFilter: column.headerFilter ? "input" : null,
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

  function createColumnDefinition(config, rows) {
    let columnDefinition = [];

    if (rows[0].columns) {
      getColumns(config, rows[0].columns).forEach((column) => {
        columnDefinition.push(column);
      });
    }

    if (rows[0].columnGroups) {
      rows[0].columnGroups.forEach((columnGroup) => {
        let newColumns = [];

        if (columnGroup.columns) {
          getColumns(config, columnGroup.columns).forEach((column) => {
            newColumns.push(column);
          });
        }

        if (columnGroup.nestedColumnGroups) {
          columnGroup.nestedColumnGroups.forEach((nestedColumnGroup) => {
            if (nestedColumnGroup.columns) {
              let newNestedColumnGroup = {
                title: nestedColumnGroup.title,
                columns: getColumns(config, nestedColumnGroup.columns),
                headerMenu: headerMenu(nestedColumnGroup),
              };
              newColumns.push(newNestedColumnGroup);
            }
          });
        }

        let newColumnGroup = {
          title: columnGroup.title,
          columns: newColumns,
          headerMenu: headerMenu(columnGroup),
        };

        columnDefinition.push(newColumnGroup);
      });
    }
    return columnDefinition;
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
        if (columnGroup.nestedColumnGroups) {
          columnGroup.nestedColumnGroups.forEach((nestedColumnGroup) => {
            if (nestedColumnGroup.columns) {
              let dataObject = setRow(nestedColumnGroup.columns);
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
