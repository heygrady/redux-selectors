import memoizeSelector from '../src/memoizeSelector'

describe('redux-selectors', () => {
  let state
  beforeEach(() => {
    state = {
      one: 1,
      two: 2,
    }
  })
  describe('memoizeSelector', () => {
    it('memoizes a selector', () => {
      const selector = jest.fn((state) => state.two)
      const memoizedSelector = memoizeSelector(selector)
      memoizedSelector(state)
      memoizedSelector(state) // <-- memoized
      const result = memoizedSelector(state) // <-- memoized
      expect(result).toBe(2)
      expect(selector).toHaveBeenCalledTimes(1)
    })
    it('correctly handles new state', () => {
      const selector = jest.fn((state) => state.two)
      const memoizedSelector = memoizeSelector(selector)
      memoizedSelector(state)
      memoizedSelector(state) // <-- memoized
      const newState = { ...state, two: 3 }
      const result = memoizedSelector(newState) // <-- not memoized
      expect(result).toBe(3)
      expect(selector).toHaveBeenCalledTimes(2)
    })
    it('ignores mutated state', () => {
      const selector = jest.fn((state) => state.two)
      const memoizedSelector = memoizeSelector(selector)
      memoizedSelector(state)
      memoizedSelector(state) // <-- memoized
      state.two = 3 // <-- mutation
      const result = memoizedSelector(state) // <-- memoized
      expect(result).toBe(2)
      expect(state.two).toBe(3)
      expect(selector).toHaveBeenCalledTimes(1)
    })
    it('allows state to be an array', () => {
      const state = [0, 1, 2, 3]
      const selector = jest.fn((state) => state[2])
      const memoizedSelector = memoizeSelector(selector)
      const result = memoizedSelector(state)
      expect(result).toBe(2)
    })
  })
})
