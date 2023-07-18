import React from 'react'
import classNames from 'classnames'
import { CustomCellProps } from '../../Table'
import { DRIVES_STATUSES, NODES_STATUSES } from '../../../../consts'
import { CellValue, ColumnInstance, Row } from 'react-table'
import { Link } from 'react-router-dom'

import './blocksCell.scss'

interface ExtendedColumn extends ColumnInstance {
  showTotalCountOnly?: boolean
  isLink?: boolean
  getUrl?: (original: Partial<Row>) => string
}

function BlocksCell<Data extends Record<string, unknown>>({
  cell,
  column
}: CustomCellProps<Data>) {
  const { value, row } = cell
  const { showTotalCountOnly, isLink, getUrl } = column as unknown as ExtendedColumn

  const upBlocks = value.filter(
    ({ status }: CellValue) =>
      status === NODES_STATUSES.UP ||
      status === DRIVES_STATUSES.ACTIVE ||
      status === DRIVES_STATUSES.PHASING_OUT ||
      status === DRIVES_STATUSES.PHASING_IN
  )

  const cellContent = (
    <div className='blocks-cell'>
      <span
        className={classNames({
          'table-count-cell': true,
          'table-count-cell-is-link': isLink
        })}
      >
        {showTotalCountOnly ?? !value.length
          ? value.length
          : `${upBlocks.length}/${value.length}`}
      </span>
      <div className='blocks-wrapper'>
        {value.map(({ uid, id, status }: CellValue) => {
          const classes = classNames({
            block: true,
            [status]: true
          })

          return <div key={uid ?? id} className={classes} />
        })}
      </div>
    </div>
  )


  return isLink && getUrl ? (
    <Link to={getUrl(row.original)}>{cellContent}</Link>
  ) : (
    <>{cellContent}</>
  )
}

export default BlocksCell
