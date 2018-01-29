import createSelector, {
  createStateSelector,
  createPropsSelector
} from '../src/createSelector'

describe('redux-selectors', () => {
  let state
  let props
  beforeEach(() => {
    state = {
      one: 1,
      two: 2
    }
    props = {
      apples: true,
      oranges: false
    }
  })
  describe('createStateSelector', () => {
    it('creates a selector from a string', () => {
      const selector = createStateSelector('one')
      const result = selector(state)
      expect(result).toBe(1)
    })
    it('creates a selector from a function', () => {
      const selector = createStateSelector(state => state.two)
      const result = selector(state)
      expect(result).toBe(2)
    })
  })

  describe('createPropsSelector', () => {
    it('creates a selector from a string', () => {
      const selector = createPropsSelector('apples')
      const result = selector(state, props)
      expect(result).toBe(true)
    })
    it('creates a selector from a function', () => {
      const selector = createPropsSelector(props => props.oranges)
      const result = selector(state, props)
      expect(result).toBe(false)
    })
  })

  describe('createSelector', () => {
    it('creates a selector from a string', () => {
      const selector = createSelector('one')
      const result = selector(state)
      expect(result).toBe(1)
    })
    it('creates a selector from a function', () => {
      const selector = createSelector(state => state.two)
      const result = selector(state)
      expect(result).toBe(2)
    })
    it('creates a selector from a multiple selectors', () => {
      const selector = createSelector(
        'one',
        state => state.two,
        (one, two) => one + two
      )
      const result = selector(state)
      expect(result).toBe(3)
    })
  })
})
