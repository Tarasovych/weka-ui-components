import { useEffect } from 'react'
import { ExtendedRow, ExtendedTable } from '../types'
import { ROWS_PER_PAGE_RATIO, ROW_HEIGHT } from '../tableConsts'
import _ from 'lodash'

function useAdaptivePageSize<Data>({
  table,
  tableRef,
  miniTable,
  fixedPageSize,
  rows
}: {
  table: ExtendedTable<Data>
  tableRef: React.RefObject<HTMLDivElement>
  miniTable?: boolean
  fixedPageSize: number | undefined
  rows: ExtendedRow<Data>[]
}) {
  useEffect(() => {
    if (fixedPageSize) {
      table.setPageSize(fixedPageSize)
    } else if (miniTable && !fixedPageSize) {
      // TODO: check if rows length is expected source
      table.setPageSize(rows.length)
    }
  }, [fixedPageSize, miniTable, rows.length, table])

  useEffect(() => {
    const calcNumberOfRows = _.debounce(() => {
      const tableHeight = tableRef.current?.clientHeight
      if (tableHeight && !miniTable && !fixedPageSize) {
        table.setPageSize(tableHeight / (ROW_HEIGHT / ROWS_PER_PAGE_RATIO))
      }
    }, 350)

    calcNumberOfRows()

    window.addEventListener('resize', calcNumberOfRows)
    return () => {
      window.removeEventListener('resize', calcNumberOfRows)
    }
  }, [fixedPageSize, miniTable, table, tableRef])
}

export default useAdaptivePageSize
