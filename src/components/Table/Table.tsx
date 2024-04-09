import React, { ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  COLUMN_RESIZING_LISTENER,
  EMPTY_STRING,
  FILTER_CHANGE_LISTENER,
  FILTER_LISTENER,
  NOP,
  SAVED_RESIZED,
  SAVED_RESIZING_ENABLED
} from '../../consts'
import clsx from 'clsx'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedUniqueValues,
  getFacetedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  ColumnFilter,
  FilterFn
} from '@tanstack/react-table'
import Utils from '../../utils'
import localStorageService from '../../localStorageService'
import Loader from '../Loader'
import {
  useUrlFilters,
  useExplicitlyRemovedFilters,
  useHiddenColumns,
  usePageSize,
  usePrepareColumnDefs
} from './hooks'
import { useToggle } from '../../hooks'
import {
  ExtendedColumnFilter,
  ExtendedColumnDef,
  RowAction,
  TableExtraClasses,
  ExtendedRow
} from './types'
import { ColumnHeader, TableRow, Pagination, TableTop } from './components'
import { DefaultCell } from './exports'
import { TABLE_FILTERS_MAP } from './tableConsts'
import { customSortingFns } from './tableUtils'

import './table.scss'

interface TableProps<Data, Value> {
  columns: ExtendedColumnDef<Data, Value>[]
  data: Data[]
  filterCategory: string
  title?: string
  maxRows?: number
  rowActions?: RowAction<Data>[]
  emptyMessage?: string
  tableActions?: Array<ReactNode>
  defaultSort?: string
  globalFilter?: any
  globalFilterFn?: FilterFn<Data>
  defaultGlobalFilter?: string
  checkRowSelected?: (row: object) => boolean
  checkRowHighlighted?: (row: object) => boolean
  getRowId?: (
    originalRow: Data,
    index: number,
    parent?: ExtendedRow<Data>
  ) => string
  addFilterToUrl?: boolean
  RowSubComponent?: React.FC<{ row: any }>
  listenerPrefix?: string
  onRowClick?: (values?: Data) => void
  miniTable?: boolean
  fixedPageSize?: number
  disableActionsPortal?: boolean
  manualPagination?: boolean
  itemsAmount?: number
  canExpandAll?: boolean
  loading?: boolean
  onFiltersChanged?: (newFilters: ExtendedColumnFilter[]) => void
  defaultDescendingSort?: boolean
  manualFilters?: boolean
  initialFilters?: ColumnFilter[]
  extraClasses?: TableExtraClasses
  /**
   * Must be memoized
   */
  grouping?: string[]
  hasCustomDateFormat?: boolean
  customDateFormat?: string
  hasResizableColumns?: boolean
  hasEmptyActionsCell?: boolean
  collapseRowsOnLeavingPage?: boolean
  onSortingChange?: (sort: { id: string; desc?: boolean }) => void
  manualSorting?: boolean
}

function Table<Data, Value>(props: TableProps<Data, Value>) {
  const {
    columns: rawColumnDefs,
    data,
    rowActions = [],
    tableActions,
    title,
    defaultSort = EMPTY_STRING,
    globalFilter,
    globalFilterFn,
    defaultGlobalFilter = EMPTY_STRING,
    checkRowSelected,
    checkRowHighlighted,
    getRowId,
    addFilterToUrl,
    RowSubComponent,
    listenerPrefix,
    onRowClick = NOP,
    miniTable,
    filterCategory,
    fixedPageSize,
    disableActionsPortal,
    maxRows,
    emptyMessage,
    manualPagination,
    itemsAmount,
    canExpandAll = false,
    loading,
    onFiltersChanged,
    defaultDescendingSort = false,
    onSortingChange,
    manualSorting,
    manualFilters,
    extraClasses,
    initialFilters: initialUserFilters,
    grouping,
    hasCustomDateFormat,
    customDateFormat,
    hasResizableColumns = false,
    hasEmptyActionsCell = false,
    collapseRowsOnLeavingPage = false
  } = props

  const rowCanExpand = !!RowSubComponent

  const columnDefs = usePrepareColumnDefs({
    columnDefs: rawColumnDefs
  })

  const extendedInitialUserFilters: ExtendedColumnFilter[] | undefined =
    useMemo(
      () =>
        initialUserFilters?.map((filter) => ({
          ...filter,
          defaultFilter: true
        })),
      [initialUserFilters]
    )

  const LSResizing = localStorageService.getItem(SAVED_RESIZED)
  const initialResizing = (LSResizing &&
    JSON.parse(LSResizing)[filterCategory]) || { columnWidths: {} }

  const [explicitlyRemovedFilters, updateExplicitlyRemovedFilters] =
    useExplicitlyRemovedFilters(extendedInitialUserFilters)

  const urlFiltersConfig = useMemo(
    () =>
      columnDefs.flatMap((columnDef) => {
        const filterDef = columnDef.meta?.filter

        if (!filterDef) {
          return []
        }

        const filterType =
          typeof filterDef === 'string' ? filterDef : filterDef.type

        const filterParser = TABLE_FILTERS_MAP[filterType].parser

        return {
          id: columnDef.id,
          filterParser
        }
      }),
    [columnDefs]
  )

  const [urlFilters, setUrlFilters] = useUrlFilters({
    enabled: addFilterToUrl,
    filterConfig: urlFiltersConfig,
    filterCategory
  })
  const [allRowsExpanded, toggleAllRowsExpanding] = useToggle(false)

  const LSEnabledResizing = localStorageService.getItem(SAVED_RESIZING_ENABLED)
  const enabledResizingInLocalStorage =
    LSEnabledResizing &&
    Object.keys(JSON.parse(LSEnabledResizing)).includes(filterCategory)
      ? JSON.parse(LSEnabledResizing)[filterCategory]
      : hasResizableColumns
  const [isResizable, toggleResizable] = useToggle(
    enabledResizingInLocalStorage
  )

  const { current: initialUrlFilters = [] } = useRef(urlFilters)

  const initialFilters = useMemo(() => {
    if (!extendedInitialUserFilters) {
      return initialUrlFilters
    }

    return [...extendedInitialUserFilters]
      .filter(({ id }) => !explicitlyRemovedFilters.has(id))
      .filter(
        ({ id }) => !initialUrlFilters.find((urlFilter) => urlFilter.id === id)
      )
      .concat(initialUrlFilters)
  }, [explicitlyRemovedFilters, extendedInitialUserFilters, initialUrlFilters])

  const { hiddenInLocalStorage, onVisibilityChange } = useHiddenColumns<
    Data,
    Value
  >({
    columns: columnDefs,
    filterCategory
  })

  const table = useReactTable<Data>({
    columns: columnDefs,
    data,
    manualSorting,
    manualFilters,
    initialState: {
      columnVisibility: hiddenInLocalStorage,
      columnSizing: initialResizing,
      grouping,
      ...(defaultSort && {
        sorting: [{ id: defaultSort, desc: defaultDescendingSort }]
      }),
      columnFilters: initialFilters,
      globalFilter: defaultGlobalFilter,
      pagination: {
        pageSize: fixedPageSize || 50
      }
    },
    defaultColumn: {
      cell: DefaultCell,
      size: 100,
      sortingFn: 'basic'
    },
    sortingFns: customSortingFns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
    enableColumnResizing: isResizable,
    columnResizeMode: 'onChange',
    getRowCanExpand: () => rowCanExpand,
    autoResetExpanded:
      collapseRowsOnLeavingPage && !allRowsExpanded && manualPagination,
    autoResetPage: false,
    paginateExpandedRows: false,
    getRowId,
    ...(grouping && { getGroupedRowModel: getGroupedRowModel() }),
    ...(onSortingChange && { onSortingChange }),
  })

  table.setOptions((prev) => ({
    ...prev,
    globalFilterFn: globalFilterFn ?? prev.globalFilterFn,
    state: {
      ...prev.state,
      globalFilter: globalFilter ?? prev.state.globalFilter
    }
  }))

  const {
    pagination: { pageIndex },
    columnFilters,
    columnVisibility,
    columnSizing
  } = table.getState()

  const allColumns = table.getAllColumns()
  const pageCount = table.getPageCount()
  const isAllRowsExpanded = table.getIsAllRowsExpanded()

  const rows = table.getRowModel().rows

  useEffect(() => {
    updateExplicitlyRemovedFilters(columnFilters)
  }, [columnFilters])

  useEffect(() => {
    if (hasResizableColumns) {
      localStorageService.updateResized(filterCategory, columnSizing)
      Utils.dispatchCustomEvent(COLUMN_RESIZING_LISTENER, undefined)
    }
  }, [columnSizing, filterCategory, hasResizableColumns])

  useEffect(() => {
    if (hasResizableColumns) {
      localStorageService.updateResizedEnabled(filterCategory, isResizable)
    }
  }, [isResizable, filterCategory, hasResizableColumns])

  const isEmpty = !rows.length
  const tableClass = clsx({
    'empty-table': isEmpty,
    'react-table': true
  })
  const tableRef = useRef<null | HTMLDivElement>(null)
  const isExpandable = !!RowSubComponent

  interface ExtendedEvent extends Event {
    detail: {
      value: any
      id: any
    }
  }
  function addOrRemoveFromFilter(event: ExtendedEvent) {
    const { value, id } = event.detail
    const findFilter =
      columnFilters.find((filter) => filter.id === id)?.value || []
    const newFilter = Array.isArray(findFilter) ? [...findFilter] : [findFilter]
    if (!newFilter?.includes(value)) {
      newFilter.push(value)
    } else {
      newFilter.splice(newFilter.indexOf(value), 1)
    }
    table.setColumnFilters((prev) => [
      ...prev.filter((filter) => filter.id !== id),
      { id, value: newFilter }
    ])
  }

  useEffect(() => {
    onFiltersChanged?.(columnFilters)
    if (addFilterToUrl) {
      setUrlFilters(columnFilters)
    }
  }, [columnFilters, addFilterToUrl])

  useEffect(() => {
    onVisibilityChange(allColumns, columnVisibility)
  }, [onVisibilityChange, allColumns, columnVisibility])

  useEffect(() => {
    if (listenerPrefix) {
      document.addEventListener(
        `${listenerPrefix}${FILTER_CHANGE_LISTENER}`,
        addOrRemoveFromFilter as EventListener
      )
      Utils.dispatchCustomEvent(
        `${listenerPrefix}${FILTER_LISTENER}`,
        columnFilters
      )
      return () => {
        document.removeEventListener(
          `${listenerPrefix}${FILTER_CHANGE_LISTENER}`,
          addOrRemoveFromFilter as EventListener
        )
      }
    }
  }, [columnFilters])

  useEffect(() => {
    table.setPageIndex(0)
  }, [pageCount, table])

  useLayoutEffect(() => {
    if (!miniTable) {
      tableRef.current?.scrollTo(0, 0)
      if (collapseRowsOnLeavingPage && RowSubComponent && !isAllRowsExpanded) {
        table.toggleAllRowsExpanded(false)
      }
    }
  }, [
    pageIndex,
    RowSubComponent,
    collapseRowsOnLeavingPage,
    isAllRowsExpanded,
    miniTable,
    table
  ])

  usePageSize<Data>({ table, tableRef, miniTable, fixedPageSize, data })

  return (
    <div className={clsx('react-table-wrapper', extraClasses?.tableWrapper)}>
      {!miniTable && (
        <TableTop
          title={title}
          itemsAmount={itemsAmount}
          maxRows={maxRows}
          data={data}
          table={table}
          canExpandAll={canExpandAll}
          isExpandable={isExpandable}
          tableActions={tableActions}
          hasResizableColumns={hasResizableColumns}
          isResizable={isResizable}
          toggleResizable={toggleResizable}
          hasCustomDateFormat={hasCustomDateFormat}
          customDateFormat={customDateFormat}
          toggleAllRowsExpanding={toggleAllRowsExpanding}
        />
      )}
      {!loading ? (
        <div
          className={clsx({
            'mini-table': miniTable,
            'scroll-wrapper': true
          })}
          ref={tableRef}
        >
          <table
            className={tableClass}
            style={{
              width: '100%'
            }}
          >
            <thead className='sticky-header'>
              {table.getHeaderGroups().map((headerGroup) => (
                <ColumnHeader
                  key={headerGroup.id}
                  headerGroup={headerGroup}
                  table={table}
                  rowCanExpand={rowCanExpand}
                  grouping={grouping}
                  rowActions={rowActions}
                  hasEmptyActionsCell={hasEmptyActionsCell}
                  isResizable={isResizable}
                />
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  row={row}
                  columns={allColumns}
                  isExpandable={isExpandable}
                  grouping={grouping}
                  RowSubComponent={RowSubComponent}
                  onRowClick={onRowClick}
                  checkRowSelected={checkRowSelected}
                  checkRowHighlighted={checkRowHighlighted}
                  rowActions={rowActions}
                  hasEmptyActionsCell={hasEmptyActionsCell}
                  isResizable={isResizable}
                  disableActionsPortal={disableActionsPortal}
                  extraClasses={extraClasses}
                  rowCanExpand={rowCanExpand}
                />
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <span className='empty-message'>
              {emptyMessage || (title ? `No ${title}` : `No ${rows}`)}
            </span>
          )}
        </div>
      ) : (
        <Loader />
      )}
      {(!miniTable || fixedPageSize) && !manualPagination && (
        <div className='footer'>
          <Pagination
            onPageChange={(pageNumber) => table.setPageIndex(pageNumber - 1)}
            numberOfPages={pageCount}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}

export default React.memo(Table)
