import { TabulatorFull as Tabulator } from "tabulator-tables";
import {
  setVisualizationTheme,
  setTextWrapping,
} from "../visualizationThemes/visualizationThemes.js";
import { getFormat, formatDate } from "../formatters/formatters.js";
import { getEditorType } from "../formatters/editors.js";

function getAlignment(alignment) {
  return alignment === "center" || alignment === "right" ? alignment : "left";
}

function formatAccessor(value, _data, _type, _params, column) {
  const formatter = column.getDefinition()?.formatter;

  if (typeof formatter === "function") {
    try {
      return formatter(value);
    } catch (error) {
      console.warn("Formatter error:", error);
    }
  }

  return value;
}

// Navigation to Elements Identifier
const elementIds = {};

// Context Menu
let contextMenu = null;
let menuItems = [];
let menuItemClickHandlers = [];
let focusedItemIndex = 0;
let cleaningUp = false;
let navigateToElement = null;

function cleanup() {
  if (cleaningUp || !contextMenu) {
    return;
  }
  cleaningUp = true;

  focusedItemIndex = 0;

  contextMenu.removeEventListener("keydown", handleKeydown);
  document.body.removeEventListener("click", cleanupFunction);
  document.removeEventListener("contextmenu", contextListener);

  menuItemClickHandlers.forEach((handler) => {
    document.removeEventListener("click", handler);
  });
  menuItemClickHandlers = [];

  contextMenu.remove();
  contextMenu = null;
  cleaningUp = false;
}

function customContextMenu(e, cell) {
  e.preventDefault();

  cleanup();

  const cellElement = cell.getElement();
  contextMenu = document.createElement("div");
  contextMenu.classList.add("custom-context-menu");
  contextMenu.setAttribute("role", "menu");
  contextMenu.setAttribute("tabindex", "-1");

  menuItems.forEach((item, index) => {
    const menuItem = document.createElement("div");
    menuItem.className = "context-menu-item";
    menuItem.textContent = item.text;
    menuItem.setAttribute("data-action", item.action);
    menuItem.setAttribute("role", "menuitem");
    menuItem.setAttribute("tabindex", index === 0 ? "0" : "-1");

    const clickHandler = (e) => {
      if (contextMenu) {
        if (item.action === "navigate" && navigateToElement) {
          navigateToElement(e, cell);
        } else if (item.action === "edit") {
          cell.edit();
        }

        cleanup();
      }
    };

    menuItem.addEventListener("click", clickHandler);
    menuItemClickHandlers.push(clickHandler);
    contextMenu.appendChild(menuItem);
  });

  const cellRect = cellElement.getBoundingClientRect();
  contextMenu.style.position = "absolute";
  contextMenu.style.left = `${cellRect.left}px`;
  contextMenu.style.top = `${cellRect.bottom}px`;

  document.body.appendChild(contextMenu);

  const activeItem = document.querySelector('.context-menu-item[tabindex="0"]');
  if (activeItem) {
    activeItem.focus();
  }

  document.body.addEventListener("click", cleanupFunction);
  document.addEventListener("contextmenu", contextListener);

  // Handle key presses
  contextMenu.addEventListener("keydown", handleKeydown);
}

function cleanupFunction(e) {
  var button = e.which || e.button; // Firefox - Right click check
  if (button && button !== 1) {
    return;
  }
  cleanup();
}

function contextListener(e) {
  let element = e.srcElement || e.target;
  if (
    element.classList.contains("tabulator-cell") ||
    element.classList.contains("context-menu-item")
  ) {
    return;
  }
  cleanup();
}

function handleKeydown(event) {
  // Ignore IME composition
  if (event.isComposing || event.keyCode === 229) {
    return;
  }

  const menuItems = contextMenu.querySelectorAll(".context-menu-item");

  switch (event.keyCode) {
    // Enter key
    case 13:
      event.preventDefault();
      menuItems[focusedItemIndex].click();
      break;

    // Close menu with ESC key
    case 27:
      event.preventDefault();
      cleanup();
      break;

    // ArrowUp key
    case 38:
      event.preventDefault();
      focusedItemIndex =
        (focusedItemIndex - 1 + menuItems.length) % menuItems.length;
      updateFocusedItem(menuItems, focusedItemIndex);
      break;

    // ArrowDown key
    case 40:
      event.preventDefault();
      focusedItemIndex = (focusedItemIndex + 1) % menuItems.length;
      updateFocusedItem(menuItems, focusedItemIndex);
      break;
  }
}

function updateFocusedItem(menuItems, index) {
  menuItems.forEach((item, i) => {
    item.tabIndex = i === index ? "0" : "-1";
  });
  menuItems[index].focus();
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
      formatter:
        getFormat[column.format] ||
        (column.format && column.format.includes("%")
          ? (cell) => formatDate(cell, column.format)
          : column.format),
      contextMenu: customContextMenu,
      accessorClipboard: formatAccessor,
    };

    columnDefinition.push(newColumn);
  });

  return columnDefinition;
}

function getGroupHeader(data) {
  return data.groupBy || "Other";
}

export function visualization(config) {
  console.log("debug");
  const configStyle = config.style;
  const configData = config.data;
  const initialRowEnabled = configStyle.initialRow?.enabled === true || false;
  const mainElement = document.getElementById(config.element);
  const tabulatorDiv = document.createElement("div");

  setVisualizationTheme(configData.theme, configData.rows[0].groupRows);

  if (configData.textWrap) {
    setTextWrapping();
  }

  if (configData.navigable) {
    menuItems.push({ text: "Navigate to Element", action: "navigate" });

    navigateToElement = (event, cell) => {
      const row = cell.getRow();
      const key = row && row.getData()?.rowKey;
      if (key) {
        const elementId = elementIds[key]
        if (elementId) {
          config.functions.performAction("Cell Click", elementId, event);
        }
      }
    };
  }

  if (configData.editable) {
    menuItems.push({ text: "Edit Cell", action: "edit" });
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

      // Can't change the displayed text content; using two elements and CSS instead
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
                // Vulnerable to same title problems, need to fix.
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

  const tableConfig = {
    height: "350px",
    data: transformJson(configData.rows),
    layout: "fitColumns",
    movableColumns: true,
    resizableRows: true,
    headerSortClickElement: "icon",
    editTriggerEvent: "dblclick",

    //enable range selection
    selectableRange: 1,
    selectableRangeColumns: true,
    selectableRangeRows: initialRowEnabled,
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

    // rowFormatter: function(row){
    //   console.log(row);
    //   console.log(elementIds);
    //   // row.elementId = true
    //   //row.getElement().setAttribute('row-element-id', row.id);

    //   // could add an object that stores [row-id = row-element-id]

    //   // row-id stored in row data (reserved keyword - can add to display but not to be modified)
    //   //elementIds[row-id] = row-element-id

    //   //elementId = elementIds[getData().row-id]
    // },

    columns: createColumnDefinition(config, configData.rows, table),

    ...(configData.rows[0].groupRows
      ? {
          groupBy: getGroupHeader,
          groupHeader: function (value, count) {
            return value + "<span>(" + count + " items)</span>";
          },
        }
      : {}),
  };

  if (initialRowEnabled) {
    tableConfig.rowHeader = {
      title: configStyle.initialRow.title ?? "ID",
      resizable: false,
      frozen: configStyle.initialRow.frozen === true,
      width: 40,
      hozAlign: "center",
      formatter: "rownum",
      cssClass: "range-header-col",
      editor: false,
      headerSort: false,
    };
  }

  var table = new Tabulator(tabulatorDiv, tableConfig);

  mainElement.appendChild(tabulatorDiv);
}

export function transformJson(rows) {
  let newData = [];

  function setRow(columns) {
    let newDataRow = {};
    columns.forEach((column) => {
      // Vulnerable to columns with same title. Need to fix.
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
    if (row.id) {
      const rowKey = Object.keys(elementIds).length + 1;
      dataRow["rowKey"] = rowKey
      elementIds[rowKey] = row.id;
    }
    newData.push(dataRow);
  });

  return JSON.parse(JSON.stringify(newData));
}
