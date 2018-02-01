import get from 'lodash.get'
import memoizeSelector from './memoizeSelector'

export const mapSelectorsToArgs = selectors => args =>
  selectors.map(selector => selector.apply(null, args))

export const createStateSelector = selector => {
  if (typeof selector === 'string' || Array.isArray(selector)) {
    return state => get(state, selector)
  }
  return selector
}

export const createPropsSelector = selector => {
  const propSelector = createStateSelector(selector)
  return (_, props) => propSelector(props)
}

const createSelector = (...selectors) => {
  const length = selectors.length
  if (length > 1) {
    const resultsFunc = createStateSelector(selectors[length - 1])
    const otherSelectors = selectors
      .slice(0, -1)
      .map(createStateSelector)
    return memoizeSelector((...args) => {
      const values = mapSelectorsToArgs(otherSelectors)(args)
      return resultsFunc.apply(null, values)
    })
  }
  return createStateSelector(selectors[0])
}

export default createSelector
