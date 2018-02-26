import get from './get'
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

const createDependentSelector = selectors => {
  selectors = selectors.map(createStateSelector)
  const resultsFunc = selectors[selectors.length - 1]
  selectors = selectors.slice(0, -1)
  const mapArgs = mapSelectorsToArgs(selectors)
  return memoizeSelector((...selectorArgs) => {
    const values = mapArgs(selectorArgs)
    return resultsFunc.apply(null, values)
  })
}

const createSelector = (...selectors) => {
  if (selectors.length > 1) {
    return createDependentSelector(selectors)
  }
  return createStateSelector(selectors[0])
}

export default createSelector
