import memoizeSelector, { createKeyMap } from '../src/memoizeSelector'

describe('redux-selectors', () => {
  let state
  beforeEach(() => {
    state = {
      one: 1,
      two: 2
    }
  })
  describe('createKeyMap', () => {
    let getKey
    let one
    let two
    let three
    beforeEach(() => {
      getKey = createKeyMap()
      one = { one: 1 }
      two = { two: 2 }
      three = { three: 3 }
    })
    it('returns the same key (one arg)', () => {
      const key1 = getKey([one])
      const key2 = getKey([one])
      expect(key1).toBe(key2)
    })
    it('returns the same key (two args)', () => {
      const key1 = getKey([one, two])
      const key2 = getKey([one, two])
      expect(key1).toBe(key2)
    })
    it('returns the same key (three args)', () => {
      const key1 = getKey([one, two, three])
      const key2 = getKey([one, two, three])
      expect(key1).toBe(key2)
    })
    it('returns the raw value for one arg', () => {
      const key1 = getKey([one])
      expect(key1).toBe(one)
    })
    it('returns a WeakSet for two args', () => {
      const key1 = getKey([one, two])
      expect(key1 instanceof WeakSet).toBe(true)
    })
    it('returns a WeakSet with all args', () => {
      const args = [one, two, three]
      const key1 = getKey(args)
      const hasAll = args.every(arg => key1.has(arg))
      expect(hasAll).toBe(true)
    })
    it('handles increasing numbers of args', () => {
      // order is important: 1, 2, 3, 2
      getKey([one])
      const key1 = getKey([one, two])
      getKey([one, two, three])
      const key2 = getKey([one, two])
      expect(key1).toBe(key2)
    })
  })
  describe('memoizeSelector', () => {
    it('memoizes a selector', () => {
      const selector = jest.fn(state => state.two)
      const memoizedSelector = memoizeSelector(selector)
      memoizedSelector(state)
      memoizedSelector(state) // <-- memoized
      const result = memoizedSelector(state) // <-- memoized
      expect(result).toBe(2)
      expect(selector).toHaveBeenCalledTimes(1)
    })
    it('correctly handles new state', () => {
      const selector = jest.fn(state => state.two)
      const memoizedSelector = memoizeSelector(selector)
      memoizedSelector(state)
      memoizedSelector(state) // <-- memoized
      const newState = { ...state, two: 3 }
      const result = memoizedSelector(newState) // <-- not memoized
      expect(result).toBe(3)
      expect(selector).toHaveBeenCalledTimes(2)
    })
    it('ignores mutated state', () => {
      const selector = jest.fn(state => state.two)
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
      const selector = jest.fn(state => state[2])
      const memoizedSelector = memoizeSelector(selector)
      const result = memoizedSelector(state)
      expect(result).toBe(2)
    })
  })
})
