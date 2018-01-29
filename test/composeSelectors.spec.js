import composeSelectors from '../src/composeSelectors'

describe('redux-selectors', () => {
  let state
  beforeEach(() => {
    state = {
      forkOne: {
        forkTwo: {
          one: 1,
          two: 2
        }
      }
    }
  })

  describe('composeSelectors', () => {
    it('returns an deep value', () => {
      const selector = composeSelectors('forkOne', 'forkTwo', 'one')
      console.log(selector(state))
      const result = selector(state)
      expect(result).toBe(1)
    })

    it('creates selectors', () => {
      const selector = composeSelectors(
        'forkOne',
        state => state.forkTwo,
        'one'
      )
      const result = selector(state)
      expect(result).toBe(1)
    })
  })
})
