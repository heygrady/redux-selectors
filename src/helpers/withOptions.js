import memoizeSelector from '../memoizeSelector'

const createOptionsMap = () => {
  const keyMap = new Map()
  return options => {
    const key = JSON.stringify(options)
    if (!keyMap.has(key)) {
      keyMap.set(key, JSON.parse(key))
    }
    return keyMap.get(key)
  }
}

const defaultArgsFilter = args => args
export const filterState = ([state]) => [state]

const withOptions = (creator, argsFilter = defaultArgsFilter) => {
  const normalize = createOptionsMap()
  const selector = memoizeSelector((options, ...selectorArgs) =>
    creator(...options)(...selectorArgs)
  )
  return (...options) => (...selectorArgs) =>
    selector(normalize(options), ...argsFilter(selectorArgs))
}

export default withOptions
