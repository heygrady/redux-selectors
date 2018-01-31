import { createStateSelector } from './createSelector'
import memoizeCreator from './memoizeCreator'

export const USE_PROPS_AS_ARGS =
  '@@comfy/redux-selectors/withArgs/USE_PROPS_AS_ARGS'

const withArgs = selectorCreator => {
  const creator = memoizeCreator(selectorCreator)
  return (...args) => {
    if (args[0] === USE_PROPS_AS_ARGS) {
      const [, ...propSelectors] = args
      const selectProps = propSelectors.map(createStateSelector)

      return (...selectorArgs) => {
        const [, ...props] = selectorArgs
        let finalProps = props
        if (selectProps.length) {
          finalProps = selectProps.map((selector, i) =>
            selector(props[i] !== undefined ? props[i] : props[0])
          )
        }
        const selector = creator.apply(null, finalProps)
        return selector.apply(null, selectorArgs)
      }
    }
    return creator.apply(null, args)
  }
}

export default withArgs
