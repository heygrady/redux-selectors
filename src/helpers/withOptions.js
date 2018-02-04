import memoizeSelector from '../memoizeSelector'

const MAX_KEYS = 100

const createOptionsMap = () => {
  const wrapperMap = new Map()
  const keys = []
  const trimCache = () => {
    while (keys.length > MAX_KEYS) {
      wrapperMap.delete(keys.shift())
    }
  }
  return options => {
    const key = JSON.stringify(options)
    let wrapper
    if (!wrapperMap.has(key)) {
      wrapper = {}
      wrapperMap.set(key, {})
      keys.push(key)
      trimCache()
    }
    wrapper = wrapperMap.get(key)
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
