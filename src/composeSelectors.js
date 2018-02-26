import { compose } from 'redux'
import { createStateSelector } from './createSelector'

const composeSelectors = (...selectors) => {
  const mappedSelectors = selectors
    .map(selector => createStateSelector(selector))
    .reverse()
  return compose.apply(null, mappedSelectors)
}

export default composeSelectors
