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

// Collapsible columns
const collapsedGroups = {};

// Navigation to Elements Identifier
const elementIds = {};

// Width Sizing
const WIDTH_CONFIG = {
  tableSettings: {
    maxWidth: 800
  },
  columnSettings: {
    defaultWidth: 200
  }
}

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

const handleTableWidth = (tabulatorDivRef, customWidth, tableElement) => {
  if (!tabulatorDivRef.current || !tableElement) return;

  const columns = tableElement.getColumns();
  
  const totalColumnsWidth = columns.reduce((sum, col) => {
    return sum + (col.getWidth() || 100);
  }, 0);

  const pxToNumber = (pxString) => {
    if (typeof pxString === 'number') return pxString;
    return parseInt(pxString.replace('px', '')) || 0;
  }

  let finalWidth;

  if (customWidth) {
    finalWidth = pxToNumber(customWidth);
  } else {
    finalWidth = totalColumnsWidth;
  }

  const maxWidth = WIDTH_CONFIG.tableSettings.maxWidth
  if (maxWidth && finalWidth > maxWidth && !customWidth) {
    finalWidth = maxWidth;
  }

  tabulatorDivRef.current.style.width = `${finalWidth}px`;

  // max width size before scrollbar appears
  // width to be adjusted to columns (fit to columns - but don't stretch) - if exceeds max width, force it to max width
  // custom width to overwrite default / max width
}

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
      width: column.width || WIDTH_CONFIG.columnSettings.defaultWidth,
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

const getDescendants = (group, ignoreFirstIndex) => {
  let columns = [];

  let isFirstIndexIgnored = ignoreFirstIndex || false;

  if (group.columns) {
    group.columns.forEach((column) => {
      if (!isFirstIndexIgnored) {
        isFirstIndexIgnored = true;
        return;
      }

      columns.push(column.title);
    });
  }

  if (group.subGroups) {
    group.subGroups.forEach((subGroup) => {
      columns = [...columns, ...getDescendants(subGroup, isFirstIndexIgnored)];
    });
  }

  return columns;
};

const HeaderContent = ({ initialValue, group, table }) => {
  const [_isCollapsed, setIsCollapsed] = useState({});
  const groupId = group.title;

  const adjustColumns = (targetGroup, isCollapsed, parentCollapsed = false) => {
    const groupColumns = getDescendants(targetGroup);

    if (parentCollapsed) {
      // Keep child columns hidden
      groupColumns.forEach((field) => {
        table.hideColumn(field);
      });
      return;
    }

    groupColumns.forEach((field) => {
      if (isCollapsed) {
        table.hideColumn(field);
      } else {
        // Only show if parent group is not collapsed
        table.showColumn(field);
      }
    });

    if (targetGroup.subGroups) {
      targetGroup.subGroups.forEach((subGroup) => {
        if (subGroup.columns) {
          const subGroupId = subGroup.title;
          console.log(collapsedGroups);
          adjustColumns(
            subGroup,
            collapsedGroups[subGroupId] || false,
            isCollapsed || parentCollapsed
          );
        }
      });
    }
  };

  const handleClick = () => {
    const newCollapsedState = !collapsedGroups[groupId];

    setIsCollapsed(newCollapsedState);
    collapsedGroups[groupId] = newCollapsedState;

    adjustColumns(group, newCollapsedState);
    table.redraw();
  };

  return (
    <span className="flex items-center gap-2">
      {initialValue}
      <div className="dropdown">
        <div className="menu-icon cursor-pointer" onClick={handleClick}>
          {collapsedGroups[groupId] ? (
            <BsCaretRightFill />
          ) : (
            <BsCaretDownFill />
          )}
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

      console.log("debug"); // Kept to avoid trouble finding this file in Inspect Element Sources
      const configStyle = config.style;
      const configData = config.data;
      const initialRowEnabled =
        configStyle.initialRow?.enabled === true || false;
      const customTableWidth = configStyle.tableConfig.width;

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
        // automatic resize so there isn't a scrollbar at the bottom
        data: transformJson(configData.rows),
        layout: "fitDataTable",
        responsiveLayout: false,
        movableColumns: true,
        resizableRows: true,
        headerSortClickElement: "icon",
        editTriggerEvent: "dblclick",
        headerSortElement: function (_column, dir) {
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
          tabulatorDivRef.current.style.height = "700px";
          handleTableWidth(tabulatorDivRef, customTableWidth, table)
          tableRef.current.redraw();
        }, 100);
      });

      tableRef.current = table;
    }
  }, [config]);

  return <div ref={tabulatorDivRef}></div>;
}

export default App;
