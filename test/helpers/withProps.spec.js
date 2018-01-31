import { withProps } from '../../src/helpers/index'
import { createPropsSelector } from '../../src/createSelector'
import combineSelectors from '../../src/combineSelectors'

describe('redux-selectors', () => {
  let state
  let ownProps
  let mapStateToProps
  beforeEach(() => {
    state = {
      foo: 'bar'
    }
    ownProps = { id: 1 }
    mapStateToProps = withProps(combineSelectors({
      item: state => state.foo,
      id: createPropsSelector(props => props.id)
    }))
  })
  describe('withProps', () => {
    it('returns the correct value', () => {
      const result = mapStateToProps(state, ownProps)
      expect(result).toEqual({ item: 'bar', id: 1 })
    })
  })
})
