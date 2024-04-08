import React from 'react'
import { ExtendedCellProps } from '../../../types'

type ProgressCellValue = {
  status: string
  progress: string
}

function ProgressCell<Data>({
  cell
}: ExtendedCellProps<Data, ProgressCellValue>) {
  const { status, progress } = cell.getValue()

  const stringToShow = progress !== 'N/A' ? `${status} - ${progress}` : status
  return <div>{stringToShow}</div>
}

export default ProgressCell
