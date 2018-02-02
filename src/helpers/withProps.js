import { createStateSelector } from '../createSelector'
import withOptions, { filterState } from './withOptions'

export const mapSelectorsToProps = selectors => props =>
  selectors.map((selector, i) => {
    const arg = props[i] !== undefined ? props[i] : props[0]
    return selector !== undefined ? selector(arg) : undefined
  })

const withProps = (selectorCreator, ...propSelectors) => {
  const creator = withOptions(selectorCreator, filterState)
  const hasPropSelectors = propSelectors.length > 0
  let applyProps
  if (hasPropSelectors) {
    const selectors = propSelectors.map(createStateSelector)
    applyProps = mapSelectorsToProps(selectors)
  }
  return (...selectorArgs) => {
    const [, ...props] = selectorArgs
    let creatorArgs = props
    if (hasPropSelectors) {
      creatorArgs = applyProps(props)
    }
    const selector = creator.apply(null, creatorArgs)
    return selector.apply(null, selectorArgs)
  }
}

export default withProps
