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

  const cellContextMenu = [
    {
      label: "Copy Cell",
      action: function (_event, cell) {
        const cellElement = cell.getElement();
        const formattedValue =
          cellElement.innerText.trim() || cell.getValue() || "";
        navigator.clipboard
          .writeText(formattedValue)
          .then(() => {
            console.log("Copied to clipboard: ", formattedValue);
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
          });
      },
    },
  ];

  if (config.data.editable) {
    cellContextMenu.push({
      label: "Edit Cell",
      action: function (e, cell) {
        cell.edit();
      },
    });
  }

  if (config.data.navigable) {
    cellContextMenu.push({
      label: "Navigate to Element",
      action: function (event, cell) {
        const row = cell.getRow();
        const rowPosition = row.getPosition() - 1;
        config.functions.performAction(
          "Cell Click",
          config.data.rows[rowPosition].id,
          event
        );
      },
    });
  }

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
      formatter:
        getFormat[column.format] ||
        (column.format && column.format.includes("%")
          ? (cell) => formatDate(cell, column.format)
          : column.format),
      clickMenu: cellContextMenu
    };

    columnDefinition.push(newColumn);
  });

  return columnDefinition;
}

function getGroupHeader(data) {
  return data.groupBy || "Other";
}

export function visualization(config) {
  const configData = config.data;
  const mainElement = document.getElementById(config.element);
  const tabulatorDiv = document.createElement("div");

  setVisualizationTheme(configData.theme, configData.rows[0].groupRows);

  if (configData.textWrap) {
    setTextWrapping();
  }

  function headerMenu(group) {
    let menu = [];

    if (
      (group.columns ? group.columns.length : 0) +
        (group.subGroups ? group.subGroups.length : 0) >
      1
    ) {
      let label = document.createElement("span");
      let collapseTitle = document.createElement("span");
      let expandTitle = document.createElement("span");

      expandTitle.classList.add("hidden");

      expandTitle.textContent = "Expand";
      collapseTitle.textContent = "Collapse";

      function updateHeaderMenu() {
        expandTitle.classList.toggle("hidden");
        collapseTitle.classList.toggle("hidden");
      }

      label.appendChild(collapseTitle);
      label.appendChild(expandTitle);

      menu.push({
        label: label,
        action: function () {
          const columnsToToggle = new Map();
          const subGroupsToToggle = new Map();

          let isFirstIndexIgnored = false;

          if (!group || (!group.columns && !group.subGroups)) return;

          const getColumnsToToggle = () => {
            group.columns?.forEach(({ title }, index) => {
              if (index === 0) {
                isFirstIndexIgnored = true;
                return;
              }
              columnsToToggle.set(title, true);
            });

            group.subGroups?.forEach(({ title }, index) => {
              if (!isFirstIndexIgnored && index === 0) {
                isFirstIndexIgnored = true;
                return;
              }
              subGroupsToToggle.set(title, true);
            });
          };

          const toggleColumns = (columns) => {
            columns.forEach((column) => {
              if (columnsToToggle.get(column.getField())) {
                column.toggle();
              }
            });
          };

          const toggleParentColumns = (columnDefinitions) => {
            columnDefinitions.forEach((group) => {
              group.columns?.forEach(({ title, columns }) => {
                if (subGroupsToToggle.get(title) && columns) {
                  const initialColumnTitle = columns[0].title;
                  const initialColumn = table
                    .getColumns()
                    .find((column) => column.getField() === initialColumnTitle);

                  if (initialColumn) {
                    initialColumn.getParentColumn().toggle();
                  }
                }
              });
            });
          };

          getColumnsToToggle();
          toggleColumns(table.getColumns());
          toggleParentColumns(table.getColumnDefinitions());

          updateHeaderMenu();
          table.redraw();
        },
      });
    }

    return menu.length ? menu : null;
  }

  function createColumnDefinition(config, rows) {
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

  var table = new Tabulator(tabulatorDiv, {
    height: "350px",
    data: transformJson(configData.rows),
    layout: "fitColumns",
    movableColumns: true,
    resizableRows: true,
    headerSortClickElement: "icon",
    // clipboardCopyFormatter: function(type, output) {
    //   if (type === "html") {
    //     const tempElement = document.createElement("div");
    //     tempElement.innerHTML = output;
    //     const plain = Array.from(tempElement.querySelectorAll('td')).map(td => td.innerText).join(' ');
    //     return plain;
    //   }
    //   return output;
    // },

    //enable range selection
    selectableRange: 1,
    selectableRangeColumns: true,
    selectableRangeRows: true,
    selectableRangeClearCells: true,

    //configure clipboard to allow copy and paste of range format data
    clipboard: true,
    clipboardCopyRowRange: "range",
    clipboardPasteParser: "range",
    clipboardPasteAction: "range",
    clipboardCopyConfig: {
      columnHeaders: false,
      columnGroups: false,
      rowHeaders: false,
      rowGroups: false,
    },

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

  table.on("clipboardCopied", function(plain, html) {
    let copyDataArray = []
    let copyData = ''

    if (html) {
      const tempElement = document.createElement("div");
      tempElement.innerHTML = html;
      
      const htmlValues = Array.from(tempElement.querySelectorAll('td')).map(td => td.innerText.trim())

      const plainValues = plain.trim().split(/[\n\t]+/)
      
      htmlValues.forEach((value, index) => {
        if (value === '') {
          htmlValues[index] = plainValues[index] || '';
        }
      })

      copyDataArray.push(...htmlValues) // what does ... do?
      copyData = copyDataArray.join(' ')
    } else if (plain && plain.trim() !== '') {
      copyData = plain.trim()
    }

    navigator.clipboard.writeText(copyData)
    .then(() => {
      console.log("Copied to clipboard: ", copyData);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
  })

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
