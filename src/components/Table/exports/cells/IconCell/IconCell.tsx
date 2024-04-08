import React from 'react'
import clsx from 'clsx'
import Tooltip from '../../../../Tooltip'
import { EMPTY_STRING } from '../../../../../consts'
import { ExtendedCellProps } from '../../../types'
import { StatusOk } from '../../../../../svgs'

import './iconCell.scss'

export interface IconCellOptions<Data> {
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  extraClass?: string | ((values: Data) => string)
  tooltipText?: string | ((values: Data) => string)
}

type IconCellValue = string | boolean | null | undefined

function IconCell<Data>(props: ExtendedCellProps<Data, IconCellValue>) {
  const { cell, column, row } = props

  const value = cell.getValue()

  const cellDef = column.columnDef.meta?.cell
  if (cellDef && cellDef.type !== 'IconCell') {
    throw new Error('IconCell: cell options type is incorrect')
  }

  const {
    Icon = StatusOk,
    extraClass = EMPTY_STRING,
    tooltipText = EMPTY_STRING
  } = cellDef?.options ?? {}

  const additionalClass =
    extraClass instanceof Function ? extraClass(row.original) : extraClass
  const dataForTooltip =
    tooltipText instanceof Function ? tooltipText(row.original) : tooltipText

  return (
    <Tooltip data={dataForTooltip}>
      <div className={clsx('icon-cell', additionalClass)}>
        {value && <Icon />}
      </div>
    </Tooltip>
  )
}

export default IconCell
