import { TabulatorFull as Tabulator } from "tabulator-tables";
import {
  setVisualizationTheme,
  setTextWrapping,
} from "../themes/TabulatorThemes.js";
import { getFormat, formatDate } from "../formatters/TabulatorFormatters.js";
import { getEditorType } from "../formatters/TabulatorEditors.js";
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
    maxWidth: 800,
  },
  columnSettings: {
    defaultWidth: 200,
  },
};

// Reserved column names - Prevent conflicts
const RESERVED_COLUMN_NAMES = [
  "NO DATA",
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

const NO_COLUMN_DATA = [
  {
    title: "NO DATA",
    field: "NO DATA",
    width: WIDTH_CONFIG.columnSettings.defaultWidth,
    headerSort: false,
  },
];

class ColumnTracker {
  constructor() {
    this.columns = new Map();
    this.groupTitles = new Map();
  }

  getUniqueTitle(title) {
    let targetMap = this.columns;

    const count = targetMap.get(title) || 0;
    targetMap.set(title, count + 1);

    if (RESERVED_COLUMN_NAMES.includes(title) || count > 0) {
      console.warn(
        `'${title}' is a ${
          RESERVED_COLUMN_NAMES.includes(title) ? "Reserved" : "Duplicate"
        } Title | Generated a new ID: '${title}' -> '${title}_${count}'`
      );
      return `${title}_${count}`;
    }
    return title;
  }

  getUniqueGroupTitle(title) {
    let targetMap = this.groupTitles;

    const count = targetMap.get(title) || 0;
    targetMap.set(title, count + 1);

    if (count > 0) {
      console.warn(
        `${title} is a duplicate group title, new title: ${title}_${count}`
      );
      return `${title}_${count}`;
    }
    return title;
  }

  clearMapping() {
    this.columns.clear();
  }
}

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
    if (typeof pxString === "number") return pxString;
    return parseInt(pxString.replace("px", "")) || 0;
  };

  let finalWidth;

  if (customWidth) {
    finalWidth = pxToNumber(customWidth);
  } else {
    finalWidth = totalColumnsWidth;
  }

  const maxWidth = WIDTH_CONFIG.tableSettings.maxWidth;
  if (maxWidth && finalWidth > maxWidth && !customWidth) {
    finalWidth = maxWidth;
  }

  tabulatorDivRef.current.style.width = `${finalWidth}px`;
};

const getGroupHeader = (data) => {
  return data.groupBy || "Other";
};

const transformJson = (data) => {
  const columnTracker = new ColumnTracker();
  const tabulatorData = [];

  data.rows.forEach((row) => {
    const flatRow = {
      rowId: row.id,
    };

    if (row.columns) {
      row.columns.forEach((column) => {
        const columnKey = columnTracker.getUniqueTitle(column.title);
        flatRow[columnKey] = column.content;
      });
    }

    if (row.groups) {
      row.groups.forEach((group) => {
        if (group.columns) {
          group.columns.forEach((column) => {
            const columnKey = columnTracker.getUniqueTitle(column.title);
            flatRow[columnKey] = column.content;
          });
        }

        if (group.subGroups) {
          group.subGroups.forEach((subGroup) => {
            if (subGroup.columns) {
              subGroup.columns.forEach((column) => {
                const columnKey = columnTracker.getUniqueTitle(column.title);
                flatRow[columnKey] = column.content;
              });
            }
          });
        }
      });
    }

    columnTracker.clearMapping();

    tabulatorData.push(flatRow);
  });

  return tabulatorData;
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

      columns.push(column.uniqueId);
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
  const groupId = group.uniqueId;

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
          const subGroupId = subGroup.uniqueId;
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

function TabulatorApp({ config }) {
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

      function createColumnDefinition(data) {
        const columnTracker = new ColumnTracker();
        const columns = [];

        const addColumn = (columnConfig) => {
          columns.push(columnConfig);
        };

        if (data.rows && data.rows[0]) {
          const firstRow = data.rows[0];

          if (firstRow.columns) {
            firstRow.columns.forEach((column) => {
              const field = columnTracker.getUniqueTitle(column.title);
              column.uniqueId = field;
              addColumn({
                title: column.title,
                field: field,
                width: column.width || WIDTH_CONFIG.columnSettings.defaultWidth,
                headerHozAlign: getAlignment(column.alignment),
                frozen: column.frozen,
                headerSort: data.columnSorting ? column.columnSorter : false,
                resizable: data.resizable && column.resizable,
                editor:
                  data.editable && column.editable
                    ? getEditorType(column.format) || true
                    : false,
                headerFilter:
                  data.headerFiltering && column.headerFilter ? "input" : null,
                formatter:
                  getFormat[column.format] ||
                  (column.format && column.format.includes("%")
                    ? (cell) => formatDate(cell, column.format)
                    : column.format),
                contextMenu: customContextMenu,
                accessorClipboard: formatAccessor,
              });
            });
          }

          if (firstRow.groups) {
            firstRow.groups.forEach((group) => {
              let newColumns = [];
              const groupTitle = columnTracker.getUniqueGroupTitle(group.title);
              group.uniqueId = groupTitle;

              if (group.columns) {
                group.columns.forEach((column) => {
                  const field = columnTracker.getUniqueTitle(column.title);

                  const displayTitle =
                    data.showDetailedTitles && `${groupTitle}: ${column.title}`;

                  column.uniqueId = field;

                  newColumns.push({
                    title: displayTitle || column.title,
                    field: field,
                    width:
                      column.width || WIDTH_CONFIG.columnSettings.defaultWidth,
                    headerHozAlign: getAlignment(column.alignment),
                    frozen: column.frozen,
                    headerSort: data.columnSorting
                      ? column.columnSorter
                      : false,
                    resizable: data.resizable && column.resizable,
                    editor:
                      data.editable && column.editable
                        ? getEditorType(column.format) || true
                        : false,
                    headerFilter:
                      data.headerFiltering && column.headerFilter
                        ? "input"
                        : null,
                    formatter:
                      getFormat[column.format] ||
                      (column.format && column.format.includes("%")
                        ? (cell) => formatDate(cell, column.format)
                        : column.format),
                    contextMenu: customContextMenu,
                    accessorClipboard: formatAccessor,
                  });
                });
              }

              if (group.subGroups) {
                group.subGroups.forEach((subGroup) => {
                  if (subGroup.columns) {
                    group.subGroups.forEach((subGroup) => {
                      if (subGroup.columns) {
                        let subGroupColumns = [];
                        const subGroupTitle = columnTracker.getUniqueGroupTitle(
                          subGroup.title
                        );
                        subGroup.uniqueId = subGroupTitle;

                        subGroup.columns.forEach((column) => {
                          const field = columnTracker.getUniqueTitle(
                            column.title
                          );

                          const displayTitle =
                            data.showDetailedTitles &&
                            `${subGroupTitle}: ${column.title}`;

                          column.uniqueId = field;

                          subGroupColumns.push({
                            title: displayTitle || column.title,
                            field: field,
                            width:
                              column.width ||
                              WIDTH_CONFIG.columnSettings.defaultWidth,
                            headerHozAlign: getAlignment(column.alignment),
                            frozen: column.frozen,
                            headerSort: data.columnSorting
                              ? column.columnSorter
                              : false,
                            resizable: data.resizable && column.resizable,
                            editor:
                              data.editable && column.editable
                                ? getEditorType(column.format) || true
                                : false,
                            headerFilter:
                              data.headerFiltering && column.headerFilter
                                ? "input"
                                : null,
                            formatter:
                              getFormat[column.format] ||
                              (column.format && column.format.includes("%")
                                ? (cell) => formatDate(cell, column.format)
                                : column.format),
                            contextMenu: customContextMenu,
                            accessorClipboard: formatAccessor,
                          });
                        });

                        newColumns.push({
                          title: subGroupTitle,
                          columns:
                            (subGroupColumns.length <= 0 && NO_COLUMN_DATA) ||
                            subGroupColumns,
                          titleFormatter: function (cell) {
                            if (subGroupColumns?.length <= 1) {
                              return subGroupTitle;
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
                        });
                      }
                    });
                  }
                });
              }

              addColumn({
                title: groupTitle,
                columns:
                  (newColumns.length <= 0 && NO_COLUMN_DATA) || newColumns,
                titleFormatter: function (cell) {
                  if (newColumns?.length <= 1) {
                    return groupTitle;
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
              });
            });
          }
        }

        return columns;
      }

      const tableConfig = {
        data: transformJson(configData),
        layout: "fitDataTable",
        responsiveLayout: false,
        movableColumns: true,
        resizableRows: configData.resizable,
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

        columns: createColumnDefinition(configData),

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
      tabulatorDivRef.current.style.height = config.height;
      handleTableWidth(tabulatorDivRef, config.width, table);
      table.on("dataProcessed", function () {
        setTimeout(() => {
          tableRef.current.redraw();
        }, 100);
      });

      tableRef.current = table;
    }
  }, [config]);

  return <div ref={tabulatorDivRef}></div>;
}

export default TabulatorApp;
