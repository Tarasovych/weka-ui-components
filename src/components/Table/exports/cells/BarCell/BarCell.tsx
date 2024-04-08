import React from 'react'
import CapacityBar from '../../../../CapacityBar'

import './barCell.scss'
import { ExtendedCellProps } from '../../../types'

type BarCellValue = number

function BarCell<Data>({ cell }: ExtendedCellProps<Data, BarCellValue>) {
  const value = cell.getValue()

  return (
    <div className='bar-cell'>
      <span className='table-count-cell'>{`${value}%`}</span>
      <CapacityBar firstUsage={value / 100} firstColor='var(--accent-key)' />
    </div>
  )
}

export default BarCell
