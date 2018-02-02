import withProps, { mapSelectorsToProps } from '../../src/helpers/withProps'
import { createStateSelector } from '../../src/createSelector'
import combineSelectors from '../../src/combineSelectors'

describe('redux-selectors', () => {
  describe('mapSelectorsToProps', () => {
    beforeEach(() => {})
    it('returns an empty array with no selectors', () => {
      const selectors = []
      const props = [{ one: 1 }]
      const applyProps = mapSelectorsToProps(selectors)
      const result = applyProps(props)
      expect(result).toEqual([])
    })
    it('returns undefined props with undefined selector', () => {
      const selectors = [undefined]
      const props = [{ one: 1 }]
      const applyProps = mapSelectorsToProps(selectors)
      const result = applyProps(props)
      expect(result).toEqual([undefined])
    })
    it('returns value with selector', () => {
      const selectors = [createStateSelector('one')]
      const props = [{ one: 1 }]
      const applyProps = mapSelectorsToProps(selectors)
      const result = applyProps(props)
      expect(result).toEqual([1])
    })
    it('returns only value with no extra selector', () => {
      const selectors = [createStateSelector('one')]
      const props = [{ one: 1 }, { two: 2 }]
      const applyProps = mapSelectorsToProps(selectors)
      const result = applyProps(props)
      expect(result).toEqual([1])
    })
    it('returns value and undefined with undefined extra selector', () => {
      const selectors = [createStateSelector('one'), undefined]
      const props = [{ one: 1 }, { two: 2 }]
      const applyProps = mapSelectorsToProps(selectors)
      const result = applyProps(props)
      expect(result).toEqual([1, undefined])
    })
    it('returns value and extra value with extra selector', () => {
      const selectors = [createStateSelector('one'), createStateSelector('two')]
      const props = [{ one: 1 }, { two: 2 }]
      const applyProps = mapSelectorsToProps(selectors)
      const result = applyProps(props)
      expect(result).toEqual([1, 2])
    })
  })
  describe('withProps', () => {
    let state
    let ownProps
    let mapStateToProps
    beforeEach(() => {
      state = {
        foo: 'bar'
      }
      ownProps = { id: 1 }
      mapStateToProps = withProps(props =>
        combineSelectors({
          item: state => state.foo,
          id: state => props.id
        })
      )
    })
    it('returns the correct value', () => {
      const result = mapStateToProps(state, ownProps)
      expect(result).toEqual({ item: 'bar', id: 1 })
    })

    describe('with variadic props selectors', () => {
      let makeSelector
      beforeEach(() => {
        state = {
          foo: 1
        }
        ownProps = { plus: 10, minus: 2, times: 3 }
        makeSelector = (...propSelectors) =>
          withProps(
            (plus = 0, minus = 0, times = 1) => state =>
              (state.foo + plus - minus) * times,
            ...propSelectors
          )
      })
      it('passes props as first arg without propSelectors', () => {
        const selector = makeSelector()
        const extra = { ...ownProps }
        const result = selector(state, ownProps, extra)
        expect(result).toEqual(NaN)
      })
      it('maps the first prop with a selector', () => {
        const selector = makeSelector('plus')
        const result = selector(state, ownProps)
        expect(result).toBe(11)
      })
      it('maps the second prop with a selector', () => {
        const selector = makeSelector('plus', 'minus')
        const result = selector(state, ownProps)
        expect(result).toBe(9)
      })
      it('maps the second prop with a selector', () => {
        const selector = makeSelector('plus', 'minus', 'times')
        const result = selector(state, ownProps)
        expect(result).toBe(27)
      })
      it('skips extra props without selectors', () => {
        const selector = makeSelector('plus')
        const extra = { ...ownProps }
        const result = selector(state, ownProps, extra)
        expect(result).toBe(11)
      })
      it('maps extra props with a selector', () => {
        const selector = makeSelector('plus', 'extra')
        const extra = { extra: 6 }
        const result = selector(state, ownProps, extra)
        expect(result).toBe(5)
      })
      it('maps bonus props with a selector', () => {
        const selector = makeSelector('plus', 'extra', 'bonus')
        const extra = { extra: 6 }
        const bonus = { bonus: 0.5 }
        const result = selector(state, ownProps, extra, bonus)
        expect(result).toBe(2.5)
      })
      it('skips extra props without selectors (even with bonus props)', () => {
        const selector = makeSelector('plus', undefined, 'bonus')
        const bonus = { bonus: 0.5 }
        const result = selector(state, ownProps, undefined, bonus)
        expect(result).toBe(5.5)
      })
      it('skips extra props without selectors (even with extra and bonus props)', () => {
        const selector = makeSelector('plus', undefined, 'bonus')
        const extra = { extra: 6 }
        const bonus = { bonus: 0.5 }
        const result = selector(state, ownProps, extra, bonus)
        expect(result).toBe(5.5)
      })

      it('uses props when extra is undefined (even with bonus props)', () => {
        const selector = makeSelector(undefined, 'times', 'bonus')
        const bonus = { bonus: -3 }
        const result = selector(state, ownProps, undefined, bonus)
        expect(result).toBe(6)
      })
    })
  })
})
