import { TabulatorFull as Tabulator } from "tabulator-tables";
import { setVisualizerStyle } from "../visualizerStyles/visualizerStyles.js";
import { getFormat, formatDate } from "../formatters/formatters.js";

export function visualization(config) {
  var elem = document.getElementById(config.element);

  var testDiv = document.createElement("div");

  setVisualizerStyle(config.data.colorOption, config.data.groupRows);

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
        editor: column.Editable,
        headerFilter: "input",
        // cellClick: function (e, cell) {
        //   config.functions.performAction("Cell Click", cell.getInitialValue, e);
        // },
        formatter:
          getFormat[column.format] ||
          (column.format && column.format.includes("%")
            ? (cell) => formatDate(cell, column.format)
            : column.format)
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
        let newColumns = []

        if (columnGroup.columns) {
            getColumns(config, columnGroup.columns).forEach((column) => {
              newColumns.push(column);
            });
        }

        if (columnGroup.columnGroupsInGroup) {
          columnGroup.columnGroupsInGroup.forEach((columnGroupInGroup) => {
             if (columnGroupInGroup.columns) {
               let newColumnGroupInGroup = {
                 title: columnGroupInGroup.title,
                 columns: getColumns(config, columnGroupInGroup.columns),
                 headerMenu: headerMenu(columnGroupInGroup),
               };
               newColumns.push(newColumnGroupInGroup)
              }
          });
        }

        let newColumnGroup = {
          title: columnGroup.title,
          columns: newColumns,
          headerMenu: headerMenu(columnGroup),
        };

        columnDefinition.push(newColumnGroup)
      });
    }
    return columnDefinition;
  }

  function customGroupFunction(data) {
    if (data.groupBy) {
      return data.groupBy
    }
    return "Other"
  }

  var table = new Tabulator(testDiv, {
    height: "350px",
    data: transformJson(config.data.rows),
    layout: "fitColumns",
    movableColumns: true,

    //enable range selection
    selectableRange: 1,
    selectableRangeColumns: true,
    selectableRangeRows: true,
    selectableRangeClearCells: true,

    //change edit trigger mode to make cell navigation smoother
    editTriggerEvent: "dblclick",

    //configure clipboard to allow copy and paste of range format data
    clipboard: true,
    clipboardCopyStyled: false,
    clipboardCopyConfig: {
      rowHeaders: true,
      columnHeaders: true,
    },
    clipboardCopyRowRange: "range",
    clipboardPasteParser: "range",
    clipboardPasteAction: "range",

    rowHeader: {
      title: "ID",
      resizable: false,
      frozen: true,
      width: 40,
      hozAlign: "center",
      formatter: "rownum",
      cssClass: "range-header-col",
      editor: false,
    },

    //setup cells to work as a spreadsheet
    columnDefaults: {
      headerSort: false,
    },
    columns: createColumnDefinition(config, config.data.rows),

    ...(config.data.groupRows ? {
      groupBy: customGroupFunction,
      groupHeader:function(value, count, data, group){
        return value + "<span>(" + count + " items)</span>";
      },
    } : {}),
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
        if (columnGroup.columnGroupsInGroup) {
          columnGroup.columnGroupsInGroup.forEach((columnGroupInGroup) => {
            if (columnGroupInGroup.columns) {
              let dataObject = setRow(columnGroupInGroup.columns);
              for (const property in dataObject) {
                dataRow[property] = dataObject[property];
              }
            }
          });
        }
      });
    }
    if(row.groupBy) {
      dataRow["groupBy"] = row.groupBy;
    }
    newData.push(dataRow);
  });

  return JSON.parse(JSON.stringify(newData));
}
