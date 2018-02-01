import memoizeCreator from './memoizeCreator'
import withProps from './helpers/withProps'

export const USE_PROPS_AS_ARGS =
  '@@comfy/redux-selectors/withArgs/USE_PROPS_AS_ARGS'

const withArgs = selectorCreator => {
  const creator = memoizeCreator(selectorCreator)
  return (...args) => {
    if (args[0] === USE_PROPS_AS_ARGS) {
      const [, ...propSelectors] = args
      const selector = withProps(creator, ...propSelectors)
      return selector
    }
    return creator.apply(null, args)
  }
}

export default withArgs
