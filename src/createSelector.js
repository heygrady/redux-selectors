import get from 'lodash.get'
import memoizeSelector from './memoizeSelector'

const mapSelectorsToArgs = (selectors, args) =>
  selectors.map(selector => selector.apply(null, args))

export const createStateSelector = selector => {
  if (typeof selector === 'string') {
    return state => get(state, selector)
  }
  return selector
}

export const createPropsSelector = selector => {
  if (typeof selector === 'string') {
    return (_, props) => get(props, selector)
  }
  return (_, props) => selector(props)
}

const createSelector = (...selectors) => {
  const length = selectors.length
  if (length > 1) {
    const lastSelector = selectors[length - 1]
    const otherSelectors = selectors
      .slice(0, -1)
      .map(selector => createStateSelector(selector))
    return memoizeSelector((...args) => {
      const values = mapSelectorsToArgs(otherSelectors, args)
      return lastSelector.apply(null, values)
    })
  }
  return createStateSelector(selectors[0])
}

export default createSelector
