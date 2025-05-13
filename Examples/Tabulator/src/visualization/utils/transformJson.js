import { ColumnTracker } from '../libraries/columnTracker'

export function transformJson (data) {
  // Transforms JSON data into a format suitable for Tabulator
  const columnTracker = new ColumnTracker()
  const tabulatorData = []

  data.rows.forEach((row) => {
    const flatRow = {
      rowId: row.id,
      groupBy: row.groupBy
    }

    if (row.columns) {
      row.columns.forEach((column) => {
        const columnKey = columnTracker.getUniqueTitle(column.title)
        flatRow[columnKey] = column.content
      })
    }

    if (row.groups) {
      row.groups.forEach((group) => {
        if (group.columns) {
          group.columns.forEach((column) => {
            const columnKey = columnTracker.getUniqueTitle(column.title)
            flatRow[columnKey] = column.content
          })
        }

        if (group.subGroups) {
          group.subGroups.forEach((subGroup) => {
            if (subGroup.columns) {
              subGroup.columns.forEach((column) => {
                const columnKey = columnTracker.getUniqueTitle(column.title)
                flatRow[columnKey] = column.content
              })
            }
          })
        }
      })
    }

    columnTracker.clearMapping()

    tabulatorData.push(flatRow)
  })

  return tabulatorData
}
