import memoizeCreator from './memoizeCreator'

export const USE_PROPS_AS_ARGS = '@@comfy/redux-selectors/withArgs/USE_PROPS_AS_ARGS'

const withArgs = selectorCreator => {
  const creator = memoizeCreator(selectorCreator)
  return (...args) => {
    if (args[0] === USE_PROPS_AS_ARGS && args.length === 1) {
      return (...selectorArgs) => {
        const [, ...props] = selectorArgs
        const selector = creator.apply(null, props)
        return selector.apply(null, selectorArgs)
      }
    }
    return creator.apply(null, args)
  }
}

export default withArgs
