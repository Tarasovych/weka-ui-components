import React, { useEffect, useState } from 'react'
import SpanTooltip from '../../../../SpanTooltip'
import Spinner from '../../../../Spinner'
import { ExtendedCell, ExtendedCellProps } from '../../../types'
import { EMPTY_STRING } from '../../../../../consts'

export interface ApiCallCellOptions<Data, Value> {
  apiCall: (cell: ExtendedCell<Data, Value>) => Promise<string>
  errorText: string
}

function ApiCallCell<Data>(props: ExtendedCellProps<Data, unknown>) {
  const { cell } = props

  const cellDef = cell.column.columnDef.meta?.cell
  if (!cellDef?.options || cellDef.type !== 'ApiCallCell') {
    throw new Error(
      'ApiCallCell: cell options are missing or the type is incorrect'
    )
  }

  const { apiCall, errorText } = cellDef.options

  const [state, setState] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    function getData(attempt = 0) {
      apiCall(cell)
        .then((res) => {
          setState(res)
          setLoading(false)
        })
        .catch(() => {
          if (attempt < 2) {
            setTimeout(() => getData(attempt + 1), (attempt + 1) * 3000)
          } else {
            setError(errorText)
            setLoading(false)
          }
        })
    }
    getData()
  }, [])

  return isLoading ? (
    <Spinner />
  ) : (
    <SpanTooltip>{error ?? state ?? EMPTY_STRING}</SpanTooltip>
  )
}

export default ApiCallCell
