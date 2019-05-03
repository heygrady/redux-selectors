import createSelector from '../src/createSelector'
import combineSelectors from '../src/combineSelectors'

describe('redux-selectors', () => {
  let state
  beforeEach(() => {
    state = {
      forkOne: {
        one: 1,
      },
      forkTwo: {
        two: 2,
      },
    }
  })
  describe('combineSelectors', () => {
    it('returns an object', () => {
      const selector = combineSelectors({
        one: createSelector('forkOne.one'),
        two: createSelector('forkTwo.two'),
      })
      const result = selector(state)
      expect(result).toEqual({ one: 1, two: 2 })
    })

    it('creates selectors', () => {
      const selector = combineSelectors({
        one: 'forkOne.one',
        two: (state) => state.forkTwo.two,
      })
      const result = selector(state)
      expect(result).toEqual({ one: 1, two: 2 })
    })
  })
})
