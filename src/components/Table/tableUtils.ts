import { Utils } from '../..'
import { EMPTY_STRING, SEVERITIES, Severities } from '../../consts'
import utils from '../../utils'
import { ExtendedColumn, ExtendedRow, UrlFilterParser } from './types'

export const tableUtils = {
  getColumnTitle: <Data, Value>(column: ExtendedColumn<Data, Value>) => {
    const customTitle = column.columnDef.meta?.columnTitle

    return (
      customTitle ||
      (typeof column.columnDef.header === 'string'
        ? column.columnDef.header
        : column.columnDef.id ?? EMPTY_STRING)
    )
  },
  isAccessorColumn: <Data, Value>(column: ExtendedColumn<Data, Value>) =>
    'accessorFn' in column.columnDef || 'accessorKey' in column.columnDef
}

export const customSortingFns = {
  stringSort: <Data>(
    rowA: ExtendedRow<Data>,
    rowB: ExtendedRow<Data>,
    columnId: string
  ): number => {
    let a = rowA.getValue(columnId) || EMPTY_STRING
    let b = rowB.getValue(columnId) || EMPTY_STRING

    if (utils.isNumber(a) && utils.isNumber(b)) {
      if (utils.isEmpty(a)) {
        return 1
      }
      if (utils.isEmpty(b)) {
        return -1
      }
      const numberA = parseFloat(a)
      const numberB = parseFloat(b)
      if (numberA === numberB) {
        return 0
      }
      return numberA > numberB ? 1 : -1
    }

    if (utils.isIp(a) || utils.isIp(b)) {
      if (utils.isEmpty(a)) {
        return 1
      }
      if (utils.isEmpty(b)) {
        return -1
      }
      const num1 = Number(
        a
          .split('.')
          .map((num: string) => `000${num}`.slice(-3))
          .join('')
      )
      const num2 = Number(
        b
          .split('.')
          .map((num: string) => `000${num}`.slice(-3))
          .join('')
      )
      return num1 - num2
    }

    if (!utils.isString(a) || !utils.isString(b)) {
      if (Array.isArray(a) && Array.isArray(b)) {
        a = a.length
        b = b.length
        if (!a) {
          return 1
        }
        if (!b) {
          return -1
        }
      }
      if (a === b) {
        return 0
      }
      return a > b ? 1 : -1
    }

    if (!a.length) {
      return 1
    }
    if (!b.length) {
      return -1
    }

    const collator = Intl.Collator(undefined, { numeric: true })
    return collator.compare(a, b)
  },
  numberSort: <Data>(
    rowA: ExtendedRow<Data>,
    rowB: ExtendedRow<Data>,
    columnId: string
  ): number => {
    const a = rowA.getValue(columnId) || 0
    const b = rowB.getValue(columnId) || 0

    return +a - +b
  }
}

export const urlFilterParsers = {
  string: (rawValue: Parameters<UrlFilterParser>[0]) => {
    if (Array.isArray(rawValue) && rawValue[0]) {
      return rawValue[0]
    }
    return null
  },
  arrayOfStrings: (rawValue: Parameters<UrlFilterParser>[0]) =>
    Array.isArray(rawValue) ? rawValue : null,
  date: (rawValue: Parameters<UrlFilterParser>[0]) => {
    if (
      !Utils.isObject(rawValue) ||
      (!rawValue?.startTime?.[0] && !rawValue?.endTime?.[0])
    ) {
      return null
    }

    return {
      startTime: rawValue?.startTime?.[0],
      endTime: rawValue?.endTime?.[0]
    }
  },
  severity: (rawValue: Parameters<UrlFilterParser>[0]) =>
    typeof rawValue === 'string' && SEVERITIES.includes(rawValue)
      ? rawValue
      : null
} as const

export const filterFns = {
  multiSelect<Data>(
    row: ExtendedRow<Data>,
    columnId: string,
    filterValue: string[] | number[] | string
  ): boolean {
    if (!filterValue) {
      return false
    }
    if (Array.isArray(filterValue)) {
      return filterValue.some((val) => {
        const rowValue = row.getValue(columnId)

        return Array.isArray(rowValue)
          ? rowValue.some((item) => item?.toString() === val?.toString())
          : rowValue?.toString() === val?.toString()
      })
    }

    return filterValue?.toString() === row.getValue(columnId)?.toString()
  },
  date<Data>(
    row: ExtendedRow<Data>,
    columnId: string,
    { startTime, endTime }: { startTime?: string; endTime?: string }
  ): boolean {
    const valueTime = row.getValue(columnId) ?? 0
    if (typeof valueTime !== 'string') {
      throw new Error(
        `Date filter: value is not a string. ColumnId: ${columnId}`
      )
    }

    const valueDate = new Date(valueTime)

    if (startTime && endTime) {
      return new Date(endTime) >= valueDate && valueDate >= new Date(startTime)
    }

    if (startTime) {
      return valueDate >= new Date(startTime)
    }

    if (endTime) {
      return new Date(endTime) >= valueDate
    }

    return true
  },
  severity<Data>(
    row: ExtendedRow<Data>,
    columnId: string,
    filterValue: Severities
  ): boolean {
    const severity = row.getValue(columnId)

    const isSeverity = (value: any): value is Severities =>
      SEVERITIES.includes(value)

    if (!isSeverity(severity)) {
      throw new Error(
        `Severity filter: value is not a valid severity. Column ID: ${columnId}`
      )
    }

    const rowSeverityIndex = SEVERITIES.indexOf(severity)

    if (rowSeverityIndex === -1) {
      throw new Error(
        `Severity filter: value is not a valid severity. Column ID: ${columnId}`
      )
    }

    const selectedSeverityIndex = SEVERITIES.indexOf(filterValue)

    return rowSeverityIndex >= selectedSeverityIndex
  }
} as const
