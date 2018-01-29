import memoizeCreator from '../src/memoizeCreator'

describe('redux-selectors', () => {
  let args
  let state
  let selector
  let creator
  beforeEach(() => {
    args = {
      plus: 3,
      minus: 2
    }
    state = {
      one: 1,
      two: 2
    }
    creator = jest.fn((plus = 0, minus = 0) => {
      selector = jest.fn(state => state.one + plus - minus)
      return selector
    })
  })
  describe('memoizeCreator', () => {
    it('memoizes a creator', () => {
      const memoizedCreator = memoizeCreator(creator)
      const { plus, minus } = args
      memoizedCreator(plus, minus)
      memoizedCreator(plus, minus) // <-- memoized
      const result = memoizedCreator(plus, minus) // <-- memoized
      expect(typeof result).toBe('function')
      expect(creator).toHaveBeenCalledTimes(1)
    })
    it('only calls creator once', () => {
      const memoizedCreator = memoizeCreator(creator)
      const { plus, minus } = args
      memoizedCreator(plus, minus)(state)
      memoizedCreator(plus, minus)(state) // <-- memoized
      const result = memoizedCreator(plus, minus)(state) // <-- memoized
      expect(result).toBe(2)
      expect(creator).toHaveBeenCalledTimes(1)
    })

    it('only calls creator twice', () => {
      const memoizedCreator = memoizeCreator(creator)
      const { plus, minus } = args
      memoizedCreator(plus, minus)(state)
      memoizedCreator(plus, minus)(state) // <-- memoized
      const result = memoizedCreator(0, 0)(state) // <-- not  memoized
      expect(result).toBe(1)
      expect(creator).toHaveBeenCalledTimes(2)
    })
    it('only calls creator twice (empty args)', () => {
      const memoizedCreator = memoizeCreator(creator)
      const { plus, minus } = args
      memoizedCreator(plus, minus)(state)
      memoizedCreator(plus, minus)(state) // <-- memoized
      const result = memoizedCreator()(state) // <-- not  memoized
      expect(result).toBe(1)
      expect(creator).toHaveBeenCalledTimes(2)
    })
    it('calls the selector three times', () => {
      const memoizedCreator = memoizeCreator(creator)
      const { plus, minus } = args
      memoizedCreator(plus, minus)(state)
      memoizedCreator(plus, minus)(state) // <-- memoized
      const result = memoizedCreator(plus, minus)(state) // <-- memoized
      expect(result).toBe(2)
      expect(selector).toHaveBeenCalledTimes(3)
    })
  })
})
