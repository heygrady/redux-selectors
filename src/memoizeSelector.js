import shallowEqual from 'shallowequal'

const UNDEFINED_STATE = '@@comfy/redux-selectors/createKeyMap/UNDEFINED_STATE'

const shallowEqualEvery = (args, prevArgs) => {
  if (args === prevArgs || (!args && !prevArgs)) {
    return true
  }
  if (!args || !prevArgs || args.length !== prevArgs.length) {
    return false
  }
  if (args.length === 0) {
    return shallowEqual(args[0], prevArgs[0])
  }
  return !args.some((arg, i) => {
    return !shallowEqual(arg, prevArgs[i])
  })
}

const memoizeSelector = (selector) => {
  const cache = new WeakMap()
  const undefinedState = { UNDEFINED_STATE }

  return (...args) => {
    const state = args !== undefined ? args[0] : undefinedState
    const otherArgs =
      Array.isArray(args) && args.length > 1 ? args.slice(1) : undefined
    if (!cache.has(state)) {
      const value = selector.apply(null, args)
      const stateCache = new Map()
      stateCache.set('otherArgs', otherArgs)
      stateCache.set('value', value)
      cache.set(state, stateCache)
    } else {
      const stateCache = cache.get(state)
      const isEqual = shallowEqualEvery(otherArgs, stateCache.get('otherArgs'))
      if (!isEqual) {
        const value = selector.apply(null, args)
        stateCache.set('otherArgs', otherArgs)
        stateCache.set('value', value)
      }
    }
    return cache.get(state).get('value')
  }
}

export default memoizeSelector
