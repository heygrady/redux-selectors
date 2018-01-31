import createSelector from '../src/createSelector'
import withArgs, { USE_PROPS_AS_ARGS } from '../src/withArgs'

describe('redux-selectors', () => {
  let state
  let creator
  let selectTwo
  beforeEach(() => {
    state = {
      one: 1,
      two: 2
    }
    selectTwo = jest.fn(state => state.two)
    creator = jest.fn((plus = 0, minus = 0) =>
      createSelector('one', selectTwo, (one, two) => one + two + plus - minus)
    )
  })
  describe('withArgs', () => {
    it('creates a selector with args', () => {
      const selector = withArgs(creator)
      const result = selector(3, 2)(state)
      expect(result).toBe(4)
    })
    it('memoizes the creator', () => {
      const selector = withArgs(creator)
      selector(3, 2)(state)
      selector(3, 2)(state)
      const result = selector(3, 2)(state)
      expect(result).toBe(4)
      expect(creator).toHaveBeenCalledTimes(1)
    })
    it('calls the creator twice', () => {
      const selector = withArgs(creator)
      selector(3, 2)(state)
      selector(1, 1)(state)
      const result = selector(3, 2)(state)
      expect(result).toBe(4)
      expect(creator).toHaveBeenCalledTimes(2)
    })
    it('creates the selector once', () => {
      const selector = withArgs(creator)
      selector(3, 2)(state)
      selector(3, 2)(state)
      selector(3, 2)(state)
      expect(selectTwo).toHaveBeenCalledTimes(1)
    })
    it('creates the selector twice', () => {
      const selector = withArgs(creator)
      selector(3, 2)(state)
      selector(1, 1)(state)
      selector(3, 2)(state)
      expect(selectTwo).toHaveBeenCalledTimes(2)
    })

    describe('USE_PROPS_AS_ARGS', () => {
      beforeEach(() => {
        selectTwo = jest.fn(state => state.two)
        creator = jest.fn(({ plus = 0, minus = 0, times = 1 } = {}) =>
          createSelector(
            'one',
            selectTwo,
            (one, two) => (one + two + plus - minus) * times
          )
        )
      })
      it('creates a selector using props as args', () => {
        const selector = withArgs(creator)
        const props = { plus: 3, minus: 2 }
        selector(props)(state, props)
        const result = selector(USE_PROPS_AS_ARGS)(state, props)
        expect(result).toBe(4)
        expect(creator).toHaveBeenCalledTimes(1)
      })
      it('calls the creator once', () => {
        const selector = withArgs(creator)
        const props = { plus: 3, minus: 2 }
        selector(USE_PROPS_AS_ARGS)(state, props)
        selector(props)(state)
        expect(creator).toHaveBeenCalledTimes(1)
      })
      it('calls the creator twice', () => {
        const selector = withArgs(creator)
        const props = { plus: 3, minus: 2 }
        selector(USE_PROPS_AS_ARGS)(state, props)
        selector(props)(state)
        selector()(state)
        expect(creator).toHaveBeenCalledTimes(2)
      })
      it('creates the selector once', () => {
        const selector = withArgs(creator)
        const props = { plus: 3, minus: 2 }
        selector(USE_PROPS_AS_ARGS)(state, props)
        selector(props)(state, props)
        expect(selectTwo).toHaveBeenCalledTimes(1)
      })
      it('creates the selector twice', () => {
        const selector = withArgs(creator)
        const props = { plus: 3, minus: 2 }
        selector(USE_PROPS_AS_ARGS)(state, props)
        selector(props)(state)
        expect(selectTwo).toHaveBeenCalledTimes(2)
      })
      it('passes multiple args', () => {
        const selector = withArgs(creator)
        const props = { plus: 3, minus: 2, times: 2 }
        const result = selector(USE_PROPS_AS_ARGS)(state, props)
        expect(result).toBe(8)
      })

      describe('with optional prop selectors', () => {
        let props
        let selector
        beforeEach(() => {
          selectTwo = jest.fn(state => state.two)
          creator = jest.fn((plus = 0, minus = 0, times = 1) =>
            createSelector(
              'one',
              selectTwo,
              (one, two) => (one + two + plus - minus) * times
            )
          )
          selector = withArgs(creator)
          props = { plus: 1, minus: 2, times: 3 }
        })

        it('selects the correct prop', () => {
          const result = selector(USE_PROPS_AS_ARGS, 'plus')(state, props)
          expect(result).toBe(4)
        })
        it('selects the correct prop (using minus)', () => {
          const result = selector(USE_PROPS_AS_ARGS, 'minus')(state, props)
          expect(result).toBe(5)
        })
        it('works with one extra props object', () => {
          const result = selector(USE_PROPS_AS_ARGS, 'plus', 'minus')(
            state,
            props,
            props
          )
          expect(result).toBe(2)
        })
        it('works with two extra props objects', () => {
          const result = selector(USE_PROPS_AS_ARGS, 'plus', 'minus', 'times')(
            state,
            props,
            props,
            props
          )
          expect(result).toBe(6)
        })
        it('re-uses props when missing', () => {
          const result = selector(USE_PROPS_AS_ARGS, 'plus', 'minus', 'times')(
            state,
            props
          )
          expect(result).toBe(6)
        })
        it('re-uses props when missing (last)', () => {
          const result = selector(USE_PROPS_AS_ARGS, 'plus', 'minus', 'times')(
            state,
            props,
            props
          )
          expect(result).toBe(6)
        })
      })
    })
  })
})
