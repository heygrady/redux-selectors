import createSelector from '../createSelector'

export const withState = (...selectors) => {
  const selector = createSelector(...selectors)
  return state => selector(state)
}

export default withState
