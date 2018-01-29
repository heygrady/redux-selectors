const memoizeCreator = creator => {
  const cache = {}
  return (...args) => {
    const key = JSON.stringify(args)
    if (!cache[key]) {
      cache[key] = creator.apply(null, args)
    }
    return cache[key]
  }
}

export default memoizeCreator
