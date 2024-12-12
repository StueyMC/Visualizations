import { TabulatorFull as Tabulator } from "tabulator-tables";
import {
  setVisualizationTheme,
  setTextWrapping,
} from "../visualizationThemes/visualizationThemes.js";
import { getFormat, formatDate } from "../formatters/formatters.js";
import { getEditorType } from "../formatters/editors.js";
import {
  BsCaretRightFill,
  BsCaretDownFill,
  BsSortDown,
  BsSortUp,
} from "react-icons/bs";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

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
let adjustColumns = null;

// Reserved column names - Prevent conflicts
const RESERVED_COLUMN_NAMES = [
  "groupBy",
  "rowKey", // Could allow this so you could display the element ID within the data grid, however, rowKey's data can then be overwritten
];

const ContextMenuConfig = {
  CONTEXTMENU: null,
  MENU_ITEMS: [],
  MENU_ITEM_CLICK_HANDLERS: [],
  FOCUSED_ITEM_INDEX: 0,
  CLEANING: false,
  NAVIGATE_TO_ELEM: null,
};

const elementIds = {};

function cleanup() {
  if (ContextMenuConfig.CLEANING || !ContextMenuConfig.CONTEXTMENU) {
    return;
  }
  ContextMenuConfig.CLEANING = true;

  ContextMenuConfig.FOCUSED_ITEM_INDEX = 0;

  ContextMenuConfig.CONTEXTMENU.removeEventListener("keydown", handleKeydown);
  document.body.removeEventListener("click", cleanupFunction);
  document.removeEventListener("contextmenu", contextListener);

  ContextMenuConfig.MENU_ITEM_CLICK_HANDLERS.forEach((handler) => {
    document.removeEventListener("click", handler);
  });
  ContextMenuConfig.MENU_ITEM_CLICK_HANDLERS = [];

  ContextMenuConfig.CONTEXTMENU.remove();
  ContextMenuConfig.CONTEXTMENU = null;
  ContextMenuConfig.CLEANING = false;
}

const customContextMenu = (e, cell) => {
  e.preventDefault();

  cleanup();

  const cellElement = cell.getElement();
  ContextMenuConfig.CONTEXTMENU = document.createElement("div");
  ContextMenuConfig.CONTEXTMENU.classList.add("custom-context-menu");
  ContextMenuConfig.CONTEXTMENU.setAttribute("role", "menu");
  ContextMenuConfig.CONTEXTMENU.setAttribute("tabindex", "-1");

  ContextMenuConfig.MENU_ITEMS.forEach((item, index) => {
    const menuItem = document.createElement("div");
    menuItem.className = "context-menu-item";
    menuItem.textContent = item.text;
    menuItem.setAttribute("data-action", item.action);
    menuItem.setAttribute("role", "menuitem");
    menuItem.setAttribute("tabindex", index === 0 ? "0" : "-1");

    const clickHandler = (e) => {
      if (ContextMenuConfig.CONTEXTMENU) {
        if (item.action === "navigate" && ContextMenuConfig.NAVIGATE_TO_ELEM) {
          ContextMenuConfig.NAVIGATE_TO_ELEM(e, cell);
        } else if (item.action === "edit") {
          cell.edit();
        }

        cleanup();
      }
    };

    menuItem.addEventListener("click", clickHandler);
    ContextMenuConfig.MENU_ITEM_CLICK_HANDLERS.push(clickHandler);
    ContextMenuConfig.CONTEXTMENU.appendChild(menuItem);
  });

  const cellRect = cellElement.getBoundingClientRect();
  ContextMenuConfig.CONTEXTMENU.style.position = "absolute";
  ContextMenuConfig.CONTEXTMENU.style.left = `${cellRect.left}px`;
  ContextMenuConfig.CONTEXTMENU.style.top = `${cellRect.bottom}px`;

  document.body.appendChild(ContextMenuConfig.CONTEXTMENU);

  const activeItem = document.querySelector('.context-menu-item[tabindex="0"]');
  if (activeItem) {
    activeItem.focus();
  }

  document.body.addEventListener("click", cleanupFunction);
  document.addEventListener("contextmenu", contextListener);

  // Handle key presses
  ContextMenuConfig.CONTEXTMENU.addEventListener("keydown", handleKeydown);
};

const cleanupFunction = (e) => {
  var button = e.which || e.button; // Firefox - Right click check
  if (button && button !== 1) {
    return;
  }
  cleanup();
};

const contextListener = (e) => {
  let element = e.srcElement || e.target;
  if (
    element.classList.contains("tabulator-cell") ||
    element.classList.contains("context-menu-item")
  ) {
    return;
  }
  cleanup();
};

const handleKeydown = (event) => {
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
};

const updateFocusedItem = (menuItems, index) => {
  menuItems.forEach((item, i) => {
    item.tabIndex = i === index ? "0" : "-1";
  });
  menuItems[index].focus();
};

const getColumns = (config, columns) => {
  let columnDefinition = [];
  let usedColumnTitles = new Set();

  columns.forEach((column) => {
    if (
      RESERVED_COLUMN_NAMES.includes(column.title) ||
      usedColumnTitles.has(column.title)
    ) {
      console.warn(
        `Skipping Column Definition Setup: Column "${column.title}" is either a reserved name or a duplicate`
      );
      return;
    }

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
    usedColumnTitles.add(column.title);
  });

  return columnDefinition;
};

const getGroupHeader = (data) => {
  return data.groupBy || "Other";
};

const transformJson = (rows) => {
  let newData = [];

  function setRow(columns) {
    let dataRow = {};
    let usedColumnTitles = new Set();

    columns.forEach((column) => {
      // Skip if the column's name is already in-use.
      if (
        RESERVED_COLUMN_NAMES.includes(column.title) ||
        usedColumnTitles.has(column.title)
      ) {
        console.warn(
          `Skipped Row Setup: Column "${column.title}" is either a reserved name or a duplicate`
        );
        return;
      }

      dataRow[column.title] = column.content;
      usedColumnTitles.add(column.title);
    });

    //usedColumnTitles.clear() -- Code Review: Would it be necessary to clear the set, for memory?

    return dataRow;
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
      dataRow["rowKey"] = rowKey;
      elementIds[rowKey] = row.id;
    }

    newData.push(dataRow);
  });

  return JSON.parse(JSON.stringify(newData));
};

const HeaderContent = ({ initialValue, group, table }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleClick = () => {
    setIsCollapsed(!isCollapsed);
    adjustColumns(group);
    table.redraw();
  };

  return (
    <span className="flex items-center gap-2">
      {initialValue}
      <div className="dropdown">
        <div className="menu-icon cursor-pointer" onClick={handleClick}>
          {isCollapsed ? <BsCaretRightFill /> : <BsCaretDownFill />}
        </div>
      </div>
    </span>
  );
};

function App({ config }) {
  const tabulatorDivRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    if (tabulatorDivRef.current) {
      if (tableRef.current) {
        return;
      }

      console.log("debug");
      const configStyle = config.style;
      const configData = config.data;
      const initialRowEnabled =
        configStyle.initialRow?.enabled === true || false;

      setVisualizationTheme(configData.theme, configData.rows[0].groupRows);

      if (configData.textWrap) {
        setTextWrapping();
      }

      if (configData.navigable) {
        ContextMenuConfig.MENU_ITEMS.push({
          text: "Navigate to Element",
          action: "navigate",
        });

        ContextMenuConfig.NAVIGATE_TO_ELEM = (event, cell) => {
          const row = cell.getRow();
          const key = row && row.getData()?.rowKey;
          if (key) {
            const elementId = elementIds[key];
            if (elementId) {
              config.functions.performAction("Cell Click", elementId, event);
            }
          }
        };
      }

      if (configData.editable) {
        ContextMenuConfig.MENU_ITEMS.push({
          text: "Edit Cell",
          action: "edit",
        });
      }

      adjustColumns = (group) => {
        const columnsToToggle = new Map();
        const subGroupsToToggle = new Map();

        let isFirstIndexIgnored = false;

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
              // Better to use CSS 'Hidden' for each column?
              // Vulnerable to same title problems.
              if (subGroupsToToggle.get(title) && columns) {
                const initialColumnTitle = columns[0].title;
                const initialColumn = tableRef.current
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
        toggleColumns(tableRef.current.getColumns());
        toggleParentColumns(tableRef.current.getColumnDefinitions());
      };

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
                    titleFormatter: function (cell) {
                      if (subGroup?.columns?.length <= 1) {
                        return;
                      }

                      const container = document.createElement("div");
                      const root = createRoot(container);
                      root.render(
                        <HeaderContent
                          initialValue={cell.getValue()}
                          group={subGroup}
                          table={tableRef.current}
                        />
                      );

                      return container;
                    },
                  };
                  newColumns.push(newSubGroup);
                }
              });
            }

            let newGroup = {
              title: group.title,
              columns: newColumns,
              titleFormatter: function (cell) {
                if (newColumns?.length <= 1) {
                  return;
                }

                const container = document.createElement("div");
                const root = createRoot(container);
                root.render(
                  <HeaderContent
                    initialValue={cell.getValue()}
                    group={group}
                    table={tableRef.current}
                  />
                );

                return container;
              },
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
        layoutMode: "fitData",
        responsiveLayout: true,
        movableColumns: true,
        resizableRows: true,
        headerSortClickElement: "icon",
        editTriggerEvent: "dblclick",
        headerSortElement: function (column, dir) {
          //column - column component for current column
          //dir - current sort direction ("asc", "desc", "none")

          const container = document.createElement("div");

          const root = createRoot(container);

          switch (dir) {
            case "asc":
              root.render(
                <span>
                  <BsSortUp />
                </span>
              );
              break;
            case "desc":
              root.render(
                <span>
                  <BsSortDown />
                </span>
              );
              break;
            default:
              root.render(
                <span>
                  <BsSortUp />
                </span>
              );
          }

          return container;
        },

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

        columns: createColumnDefinition(
          config,
          configData.rows,
          tabulatorDivRef.current
        ),

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

      const table = new Tabulator(tabulatorDivRef.current, tableConfig);
      table.on("dataProcessed", function () {
        setTimeout(() => {
          tableRef.current.redraw();
          tableRef.current.setHeight("350px");
        }, 100);
      });

      tableRef.current = table;
    }
  }, [config]);

  return <div ref={tabulatorDivRef}></div>;
}

export default App;
