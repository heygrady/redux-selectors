import memoizeSelector from '../memoizeSelector'

import trimCache, { MAX_KEYS } from './trimCache'

const createOptionsMap = () => {
  const wrapperMap = new Map()
  return options => {
    const key = JSON.stringify(options)
    let wrapper
    if (!wrapperMap.has(key)) {
      wrapper = {}
      wrapperMap.set(key, {})
      if (wrapperMap.size > MAX_KEYS) {
        trimCache(wrapperMap)
      }
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
