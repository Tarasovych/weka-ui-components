import React from 'react'
import CircularProgress from '../../../../CircularProgress'
import Tooltip from '../../../../Tooltip'
import { OBS_IS_DETACHING, OBS_MODES } from '../../../../../consts'
import { RemoteTiering, Tiering } from '../../../../../svgs'

import './tieringCell.scss'
import { ExtendedCellProps } from '../../../types'

type TieringValue = {
  mode: string
  name: string
  state: string
  detachProgress: number | null
}

type TieringCellValue = TieringValue[]

function getSVG({ mode, name, state, detachProgress = 0 }: TieringValue) {
  if (state === OBS_IS_DETACHING) {
    return (
      <Tooltip data='Object Store Bucket is being detached' key={name}>
        <div>
          <CircularProgress
            progress={
              typeof detachProgress === 'number' ? detachProgress : undefined
            }
          />
        </div>
      </Tooltip>
    )
  }
  const Icon = mode === OBS_MODES.REMOTE ? RemoteTiering : Tiering
  return <Icon key={name} className={mode.toLowerCase()} />
}

function TieringCell<Data>({
  cell
}: ExtendedCellProps<Data, TieringCellValue>) {
  const value = cell.getValue()

  return <div className='tiering-cell'>{value.map((val) => getSVG(val))}</div>
}

export default TieringCell
