import React from 'react'
import clsx from 'clsx'
import { DRIVES_STATUSES, NODES_STATUSES } from '../../../../../consts'
import { Link } from 'react-router-dom'

import './blocksCell.scss'
import { ExtendedCell, ExtendedCellProps } from '../../../types'

export interface BlocksCellOptions<Data, Value> {
  showTotalCountOnly?: boolean
  isLink?: boolean
  getUrl?: (cell: ExtendedCell<Data, Value>) => string
  openInNewTab?: boolean
}

type BlocksCellValue = {
  uid: string
  id: string
  status: string
}[]

function BlocksCell<Data>(props: ExtendedCellProps<Data, BlocksCellValue>) {
  const { cell, column } = props
  const value = cell.getValue()

  const cellDef = column.columnDef.meta?.cell
  if (cellDef && cellDef.type !== 'BlocksCell') {
    throw new Error('BlocksCell: cell options type is incorrect')
  }

  const { showTotalCountOnly, isLink, getUrl, openInNewTab } =
    cellDef?.options ?? {}

  const upBlocks = value.filter(
    ({ status }) =>
      status === NODES_STATUSES.UP ||
      status === DRIVES_STATUSES.ACTIVE ||
      status === DRIVES_STATUSES.PHASING_OUT ||
      status === DRIVES_STATUSES.PHASING_IN
  )

  const cellContent = (
    <div className='blocks-cell'>
      <span
        className={clsx({
          'table-count-cell': true,
          'table-count-cell-is-link': isLink
        })}
      >
        {showTotalCountOnly ?? !value.length
          ? value.length
          : `${upBlocks.length}/${value.length}`}
      </span>
      <div className='blocks-wrapper'>
        {value.map(({ uid, id, status }) => {
          const classes = clsx({
            block: true,
            [status]: true
          })

          return <div key={uid ?? id} className={classes} />
        })}
      </div>
    </div>
  )

  return isLink && getUrl ? (
    <Link
      to={getUrl(cell)}
      {...(openInNewTab && {
        target: '_blank',
        rel: 'noopener noreferrer'
      })}
    >
      {cellContent}
    </Link>
  ) : (
    <>{cellContent}</>
  )
}

export default BlocksCell
