// TODO: make wrappers for usage with mapStateToProps to enable cache controls
import createSelector from '../createSelector'

export const withState = (...args) => {
  const selector = createSelector(...args)
  return state => selector(state)
}

export const withProps = (...args) => {
  const selector = createSelector(...args)
  return (state, props) => selector(state, props)
}
