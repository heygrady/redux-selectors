import createSelector from '../src/createSelector'
import withArgs, { USE_PROPS_AS_ARGS } from '../src/withArgs'

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
  describe('withArgs', () => {
    it('creates a selector with args', () => {
      const selector = withArgs(creator)
      const result = selector(3, 2)(state)
      expect(result).toBe(4)
    })
    it('memoizes the creator', () => {
      const selector = withArgs(creator)
      selector(3, 2)(state)
      selector(3, 2)(state)
      const result = selector(3, 2)(state)
      expect(result).toBe(4)
      expect(creator).toHaveBeenCalledTimes(1)
    })
    describe('USE_PROPS_AS_ARGS', () => {
      beforeEach(() => {
        creator = jest.fn(({ plus, minus } = {}, { hidden = 1 } = {}) =>
          createSelector(
            'one',
            state => state.two,
            (one, two) => (one + two + plus - minus) * hidden
          )
        )
      })
      it('creates a selector using props as args', () => {
        const selector = withArgs(creator)
        const props = { plus: 3, minus: 2 }
        selector(props)(state)
        const result = selector(USE_PROPS_AS_ARGS)(state, props)
        expect(result).toBe(4)
        expect(creator).toHaveBeenCalledTimes(1)
      })
      it('correctly memoizes', () => {
        const selector = withArgs(creator)
        const props = { plus: 3, minus: 2 }
        selector(USE_PROPS_AS_ARGS)(state, props)
        selector(props)(state)
        selector()(state)
        expect(creator).toHaveBeenCalledTimes(2)
      })
      it('passed multiple args', () => {
        const selector = withArgs(creator)
        const props = { plus: 3, minus: 2 }
        const extra = { hidden: 2 }
        const result = selector(USE_PROPS_AS_ARGS)(state, props, extra)
        expect(result).toBe(8)
      })
    })
  })
})
