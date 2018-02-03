import memoizeSelector from '../memoizeSelector'

const createOptionsMap = () => {
  const keyMap = new Map()
  const keys = []
  const trimCache = () => {
    if (keys.length > 30) {
      while (keys.length > 30) {
        keyMap.delete(keys.shift())
      }
    }
  }
  return options => {
    const key = JSON.stringify(options)
    if (!keyMap.has(key)) {
      keyMap.set(key, {})
      keys.push(key)
      trimCache()
    }
    const wrapper = keyMap.get(key)
    wrapper.options = options
    return wrapper
  }
}

const defaultArgsFilter = args => args
export const filterState = ([state]) => [state]

const withOptions = (creator, argsFilter = defaultArgsFilter) => {
  const wrap = createOptionsMap()
  const selector = memoizeSelector(({ options }, ...selectorArgs) =>
    creator(...options)(...selectorArgs)
  )
  return (...options) => (...selectorArgs) =>
    selector(wrap(options), ...argsFilter(selectorArgs))
}

export default withOptions
