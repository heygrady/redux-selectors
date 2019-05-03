import { createSelector } from '../src/index'

describe('redux-selectors', () => {
  let selector
  let state
  beforeEach(() => {
    state = {
      hello: true,
      one: { a: 1 },
      two: { b: 2 },
    }
    selector = createSelector(
      (state) => state.one,
      (state) => state.two,
      (one, two) => [one, two]
    )
  })
  describe('createSelector', () => {
    it('memoizes the resultsFunc (even when state changes)', () => {
      const first = selector(state)
      const nextState = {
        ...state,
        hello: false,
      }
      const second = selector(nextState)
      expect(first).toBe(second)
    })

    it('invalidates based on shallow equality', () => {
      const first = selector(state)
      const nextState = {
        ...state,
        one: { a: 1 }, // <-- fails strict equality check
        hello: false,
      }
      const second = selector(nextState)
      expect(first).toEqual(second)
      expect(first === second).toBe(false)
    })

    it('ignores mutation', () => {
      const first = selector(state)
      const nextState = {
        ...state,
        hello: false,
      }
      nextState.one.a = 15 // <-- mutation
      const second = selector(nextState)
      expect(first).toBe(second)
    })

    it('works with scalar values', () => {
      state = {
        hello: true,
        one: 1,
        two: 'b',
      }

      const first = selector(state)
      const nextState = {
        ...state,
        hello: false,
      }

      const second = selector(nextState)
      expect(first).toBe(second)
    })
  })
})
