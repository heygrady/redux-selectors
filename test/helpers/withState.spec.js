import { withState } from '../../src/helpers/index'
import combineSelectors from '../../src/combineSelectors'

describe('redux-selectors', () => {
  let state
  let mapStateToProps
  beforeEach(() => {
    state = {
      foo: 'bar',
      baz: true,
      other: false
    }
    mapStateToProps = withState(combineSelectors({
      item: state => state.foo
    }))
  })
  describe('withState', () => {
    it('returns the correct value', () => {
      const result = mapStateToProps(state)
      expect(result).toEqual({ item: 'bar' })
    })
  })
})
