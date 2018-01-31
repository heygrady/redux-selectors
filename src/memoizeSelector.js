export const createKeyMap = () => {
  const keyCache = new WeakMap()
  const keyMarker = {}
  const undefinedState = {}

  return args => {
    const lastIndex = args.length - 1
    if (args.length === 0) {
      return undefinedState
    }
    if (lastIndex === 0) {
      return args[0]
    }
    return args.reduce((map, arg, i) => {
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
