import React from 'react'
import Tooltip from '../../../../Tooltip'
import { EMPTY_STRING, SHORT_ROLES } from '../../../../../consts'
import clsx from 'clsx'

import './nodeCell.scss'
import { ExtendedCellProps } from '../../../types'

type NodeCellValue = {
  nid: string
  isBackend: boolean
  roles?: string[]
}

function NodeCell<Data>(props: ExtendedCellProps<Data, NodeCellValue>) {
  const { cell } = props

  const { nid, isBackend, roles } = cell.getValue()

  const isBackendClasses = clsx({
    'is-backend': isBackend,
    'is-client': !isBackend
  })

  const formattedRoles = roles?.length
    ? `(${roles
        ?.reduce((acc: Array<string>, role: string) => {
          SHORT_ROLES[role] ? acc.push(SHORT_ROLES[role]) : acc.push(role)
          return acc
        }, [])
        .join(', ')}) `
    : EMPTY_STRING

  return (
    <Tooltip
      data={`${nid} ${formattedRoles} (${isBackend ? 'Backend' : 'Client'})`}
    >
      <div className='node-cell'>
        <span>{nid} </span>
        {isBackend && <span>{formattedRoles}</span>}
        <span className={isBackendClasses}>{isBackend ? '(B)' : ' (C)'}</span>
      </div>
    </Tooltip>
  )
}

export default NodeCell
