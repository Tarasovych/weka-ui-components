import React, { useState, useEffect } from 'react'
import { ExtendedFilterProps } from '../../../types'
import { EMPTY_STRING } from '../../../../../consts'

import './textFilter.scss'
import FilterWrapper from '../../FilterWrapper'

function TextFilter<Data, Value>({ column }: ExtendedFilterProps<Data, Value>) {
  const filterValue = column.getFilterValue()

  if (typeof filterValue !== 'string' && filterValue !== undefined) {
    throw new Error('TextFilter only accepts string as filter value')
  }

  const [value = EMPTY_STRING, setValue] = useState(filterValue)
  useEffect(() => {
    setValue(filterValue)
  }, [filterValue])

  return (
    <FilterWrapper column={column} value={value}>
      <input
        autoFocus
        className='table-text-filter'
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        type='text'
      />
    </FilterWrapper>
  )
}

export default TextFilter
