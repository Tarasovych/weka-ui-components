import React, { useRef, useState, useEffect } from 'react'
import Tooltip from '../../../../Tooltip'
import { COLUMN_RESIZING_LISTENER, EMPTY_STRING } from '../../../../../consts'
import Utils from '../../../../../utils'
import { Link } from 'react-router-dom'
import { ExtendedCell, ExtendedCellProps } from '../../../types'

import './defaultCell.scss'

export interface DefaultCellOptions<Data, Value> {
  getUrl?: (cell: ExtendedCell<Data, Value>) => string
  openInNewTab?: boolean
  tooltipText?: string | ((cella: ExtendedCell<Data, Value>) => string)
}

type DefaultCellValue = unknown

function DefaultCell<Data>(props: ExtendedCellProps<Data, DefaultCellValue>) {
  const { cell, column } = props

  const value = cell.getValue()

  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    !Array.isArray(value) &&
    value !== null &&
    value !== undefined
  ) {
    throw new Error('DefaultCell: value is not a string or a number')
  }

  const formattedValue = Array.isArray(value)
    ? value.join(', ')
    : value?.toString() ?? EMPTY_STRING

  const cellDef = column.columnDef.meta?.cell
  if (cellDef && cellDef.type !== 'DefaultCell') {
    throw new Error(
      'DefaultCell: cell options are missing or the type is incorrect'
    )
  }

  const {
    getUrl,
    openInNewTab,
    tooltipText: customTooltipText
  } = cellDef?.options ?? {}

  const ref = useRef<null | HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState(EMPTY_STRING)

  useEffect(() => {
    const compareSize = () => {
      if (ref.current && Utils.isEllipsisActive(ref.current)) {
        setTooltip(formattedValue)
      } else {
        setTooltip(EMPTY_STRING)
      }
    }

    compareSize()
    window.addEventListener('resize', compareSize)
    document.addEventListener(COLUMN_RESIZING_LISTENER, compareSize)
    return () => {
      window.removeEventListener('resize', compareSize)
      document.removeEventListener(COLUMN_RESIZING_LISTENER, compareSize)
    }
  }, [formattedValue])

  const cellContent = (
    <div className='table-default-cell' ref={ref}>
      {formattedValue}
    </div>
  )

  return (
    <Tooltip
      data={
        customTooltipText instanceof Function
          ? customTooltipText(cell)
          : customTooltipText ?? tooltip
      }
    >
      {getUrl ? (
        <Link
          to={getUrl(cell)}
          className='table-link'
          {...(openInNewTab && {
            target: '_blank',
            rel: 'noopener noreferrer'
          })}
        >
          {cellContent}
        </Link>
      ) : (
        cellContent
      )}
    </Tooltip>
  )
}

export default DefaultCell
