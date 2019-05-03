import withState from '../../src/helpers/withState'

describe('redux-selectors', () => {
  let state
  let ownProps
  let selector
  let mapStateToProps
  beforeEach(() => {
    state = {
      foo: 'bar',
      baz: true,
      other: false,
    }
    ownProps = { bar: 'whoops!' }
    selector = (state, ownProps = {}) => ownProps.bar || state.foo
    mapStateToProps = withState(selector)
  })
  describe('withState', () => {
    it('receives ownProps without withState', () => {
      const result = selector(state, ownProps)
      expect(result).toEqual('whoops!')
    })
    it('returns the correct value', () => {
      const result = mapStateToProps(state, ownProps)
      expect(result).toEqual('bar')
    })
  })
})
