
const getMarker = (undefinedState, undefinedProps, undefinedArgs) => (selectorArgs) => {
  let [state, props, args, ...other] = selectorArgs
  const hasOther = other.length !== 0
  const marker = []
  if (state === undefined && (props !== undefined || args !== undefined || hasOther)) {
    marker.push(undefinedState)
  } else if (state !== undefined) {
    marker.push(state)
  }
  if (props === undefined && (args !== undefined || hasOther)) {
    marker.push(undefinedProps)
  } else if (props !== undefined) {
     marker.push(props)
  }
  if (args === undefined && hasOther) {
    marker.push(undefinedArgs)
  } else if (args !== undefined) {
    marker.push(args)
  }
  return hasOther ? marker.concat(other) : marker
}

export const createKeyMap = () => {
  const keyCache = new WeakMap()
  const keyMarker = {}
  const undefinedState = {}
  const undefinedProps = {}
  const undefinedArgs = {}

  const clean = getMarker(undefinedState, undefinedProps, undefinedArgs)

  return args => {
    const lastIndex = args.length - 1
    if (args.length === 0) {
      return undefinedState
    }
    if (lastIndex === 0) {
      return args[0]
    }
    return clean(args).reduce((map, arg, i, args) => {
      if (!map.has(arg)) {
        const nestedMap = new WeakMap()
        map.set(arg, nestedMap)
        if (i === lastIndex) {
          nestedMap.set(keyMarker, new WeakSet(args))
        }
      }
      if (i === lastIndex) {
        return map.get(arg).get(keyMarker)
      }
      return map.get(arg)
    }, keyCache)
  }
}

const memoizeSelector = selector => {
  const cache = new WeakMap()
  const getKey = createKeyMap()

  return (...args) => {
    const key = getKey(args)
    if (!cache.has(key)) {
      const value = selector.apply(null, args)
      cache.set(key, value)
      return value
    }
    return cache.get(key)
  }
}

export default memoizeSelector
