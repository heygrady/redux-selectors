import memoizeSelector from './memoizeSelector'
import { createStateSelector } from './createSelector'

const combineSelectors = selectorMap => {
  const keys = Object.keys(selectorMap)
  const selectors = keys.reduce((selectors, key) => {
    selectors[key] = createStateSelector(selectorMap[key])
    return selectors
  }, {})
  return memoizeSelector((...args) => {
    return keys.reduce((map, key) => {
      map[key] = selectors[key].apply(null, args)
      return map
    }, {})
  })
}

export default combineSelectors
