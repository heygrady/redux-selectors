const createKeyMap = () => {
  const keyCache = new WeakMap()

  return args => {
    const lastIndex = args.length - 1
    if (lastIndex === 0) {
      return args[0]
    }
    return args.reduce((map, arg, i) => {
      if (!map.has(arg)) {
        if (i === lastIndex) {
          map.set(arg, new WeakSet(args))
        } else {
          map.set(arg, new WeakMap())
        }
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
