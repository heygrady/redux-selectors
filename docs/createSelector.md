# createSelector(...selectors)


## Simple selector

```js
import { createSelector } '@comfy/redux-selectors'
const state = {
  one: 1,
  two: 2
}

// a string selector, not memoized
const selectOne = createSelector('one')

// a function selector, not memoized
const selectTwo = createSelector(state => state.two)
```

## Chained selector
```js
const state = {
  one: 1,
  two: 2
}

// memoized, last selector received a spread of all previous selector results
const selectTotal = createSelector(
  selectOne,
  selectTwo,
  (one, two) => one + two
)
```

## With Combine selectors

```js
const state = {
  one: 1,
  two: 2
}

// memoized, combines selectors into an object
const selectTotal = createSelector(
  combineSelectors({
    one: selectOne,
    two: selectTwo
  }),
  ({ one, two }) => one + two
)
```

## With Compose selectors

```js
const state = {
  first: {
    second: {
      one: 1,
      two: 2
    }
  }
}

// memoized, feeds state in successive selectors
const selectTotal = createSelector(
  composeSelectors(
    'first', // <-- creates a simple selector
    'second',
    // the deep state is fed into the combined selector
    combineSelectors({ one: selectOne, two: selectTwo })
  }),
  ({ one, two }) => one + two
)
```
