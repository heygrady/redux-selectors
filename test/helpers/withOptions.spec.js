import withOptions, { filterState } from '../../src/helpers/withOptions'
import { MAX_KEYS } from '../../src/helpers/trimCache'

describe('redux-selectors', () => {
  describe('withOptions', () => {
    let state
    let ownProps
    let inner
    let creator
    let selector

    beforeEach(() => {
      state = {
        foo: 'bar',
        baz: true,
      }
      ownProps = { foo: 'expected test value' }

      inner = jest.fn((options) => (state, props) => options.foo)
      creator = jest.fn((options) => inner(options))
      selector = withOptions(creator)
    })
    it('creates inner selector', () => {
      const result = selector(ownProps)(state, ownProps)
      expect(result).toBe(ownProps.foo)
    })

    it('memoizes creator/inner', () => {
      selector(ownProps)(state, ownProps)
      const result = selector(ownProps)(state, ownProps)
      expect(inner).toHaveBeenCalledTimes(1)
      expect(creator).toHaveBeenCalledTimes(1)
      expect(result).toBe(ownProps.foo)
    })

    it('calls creator/inner once when ownProps changes (but is shallow equal)', () => {
      selector(ownProps)(state, ownProps)
      const newProps = { ...ownProps }
      const result = selector(newProps)(state, newProps)
      expect(inner).toHaveBeenCalledTimes(1)
      expect(creator).toHaveBeenCalledTimes(1)
      expect(result).toBe(ownProps.foo)
    })

    it('calls creator/inner twice when ownProps changes (and is not shallow equal)', () => {
      selector(ownProps)(state, ownProps)
      const newProps = { ...ownProps, bonus: true }
      const result = selector(newProps)(state, newProps)
      expect(inner).toHaveBeenCalledTimes(2)
      expect(creator).toHaveBeenCalledTimes(2)
      expect(result).toBe(ownProps.foo)
    })

    it('calls creator/inner once when ownProps changes (argsFilter)', () => {
      selector = withOptions(creator, filterState)
      selector(ownProps)(state, ownProps)
      const newProps = { ...ownProps }
      const result = selector(newProps)(state, newProps)
      expect(inner).toHaveBeenCalledTimes(1)
      expect(creator).toHaveBeenCalledTimes(1)
      expect(result).toBe(ownProps.foo)
    })

    it('cache miss on options mutation', () => {
      selector(ownProps)(state, ownProps)
      ownProps.foo = 'whoops!'
      const result = selector(ownProps)(state, ownProps)
      expect(inner).toHaveBeenCalledTimes(2)
      expect(creator).toHaveBeenCalledTimes(2)
      expect(result).toBe('whoops!')
    })
    it('trims cache after too many options', () => {
      let n = 0
      while (n <= MAX_KEYS) {
        selector({ foo: n })(state, ownProps)
        n++
      }
      selector({ foo: 0 })(state, ownProps)
      expect(creator).toHaveBeenCalledTimes(MAX_KEYS + 2)
    })
    it.skip('performance test (will fail)', () => {
      let n = 0
      const randomInt = (max) => Math.floor(Math.random() * Math.floor(max))
      while (n < 5000) {
        n++
        selector({ foo: (n + randomInt(50) - randomInt(50)) % 500 })(
          state,
          ownProps
        )
      }
      expect(inner).toHaveBeenCalledTimes(2)
      expect(creator).toHaveBeenCalledTimes(2)
    })
  })
})
