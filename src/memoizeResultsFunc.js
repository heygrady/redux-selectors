import shallowEqual from 'shallowequal'

const memoizeResultsFunc = (selector) => {
  let prevArgs
  let prevValue

  return (...args) => {
    const isEqual = prevArgs && shallowEqual(args, prevArgs)
    if (!isEqual) {
      const value = selector.apply(null, args)
      prevArgs = args
      prevValue = value
    }
    return prevValue
  }
}

export default memoizeResultsFunc
