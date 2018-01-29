import memoizeCreator from './memoizeCreator'

const createSelectorWithArgs = creator =>
  memoizeCreator((...args) => creator.apply(null, args))

export default createSelectorWithArgs
