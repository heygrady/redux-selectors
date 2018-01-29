import createSelector from '../src/createSelector'
import createSelectorWithArgs from '../src/createSelectorWithArgs'

describe('redux-selectors', () => {
  let state
  let creator
  beforeEach(() => {
    state = {
      one: 1,
      two: 2
    }
    creator = jest.fn((plus = 0, minus = 0) =>
      createSelector(
        'one',
        state => state.two,
        (one, two) => one + two + plus - minus
      )
    )
  })
  describe('createSelectorWithArgs', () => {
    it('creates a selector with args', () => {
      const selector = createSelectorWithArgs(creator)
      const result = selector(3, 2)(state)
      expect(result).toBe(4)
    })
    it('memoizes the creator', () => {
      const selector = createSelectorWithArgs(creator)
      selector(3, 2)(state)
      selector(3, 2)(state)
      const result = selector(3, 2)(state)
      expect(result).toBe(4)
      expect(creator).toHaveBeenCalledTimes(1)
    })
  })
})
