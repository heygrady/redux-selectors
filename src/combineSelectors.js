import memoizeSelector from './memoizeSelector'
import { createStateSelector } from './createSelector'

const combineSelectors = selectorMap => {
  const keys = Object.keys(selectorMap)
  const selectors = Object.values(selectorMap).map(createStateSelector)
  return memoizeSelector((...args) => {
    return keys.reduce((map, key, i) => {
      map[key] = selectors[i].apply(null, args)
      return map
    }, {})
  })
}

export default combineSelectors
