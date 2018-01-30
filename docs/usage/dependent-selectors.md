# Dependent selectors

One of the key features of reselect is the ability to compute values from dependent selectors. This same functionality is supported in redux-selectors as well. Like reselect, you simply need to pass two or more functions to `createSelector`. The last function is treated as a "results function" while every other function is treated as a selector. The values from each dependent selector become the arguments for the results function.

Unlike simple selectors, dependent selectors are memoized using [`memoizeSelector`](/docs/api/memoizeSelector.md). This means that the value returned from the results function is cached until the state changes.

For convenience, `createSelector` supports both functional and string selectors. This enables you to easily create robust selectors on-the-fly if needed. Under the hood, each selector is passed thru [`createStateSelector`](/docs/api/createStateSelector.md) in order to transform string selectors into functional selectors.

```js
import { createSelector } '@comfy/redux-selectors'

export const selectApples = createSelector('fruit.apples')
export const selectOranges = createSelector('fruit.oranges')

// a dependent selector
export const selectTotal = createSelector(
  // use existing selectors
  selectApples,
  selectOranges,

  // or create new selectors
  'veggies.peas',
  state => state.veggies.carrots,

  // results function
  (apples, oranges, peas, carrots) => apples + oranges + peas + carrots
)

// ---

const state = {
  fruit: { apples: 1, oranges: 2 },
  veggies: { peas: 3, carrots: 4 }
}

selectTotal(state) // --> 10
```

### Using get and reselect instead

Comfy redux-selectors isn't doing anything particularly special. You can accomplish the same result with reselect. Compare the following example that uses reselect and get to accomplish the example same result. Just like redux-selectors, reselect will memoize your dependent selector.


```js
import { createSelector as createReselectSelector } 'reselect' // <-- use reselect if you want
import get from 'lodash.get'

export const selectApples = state => get(state, 'fruit.apples')
export const selectOranges = state => get(state, 'fruit.oranges')

// a dependent selector
export const selectTotal = createReselectSelector(
  // use existing selectors
  selectApples,
  selectOranges,

  // or create new selectors
  state => get(state, 'veggies.peas'),
  state => state.veggies.carrots,

  // results function
  (apples, oranges, peas, carrots) => apples + oranges + peas + carrots
)

// ---

const state = {
  fruit: { apples: 1, oranges: 2 },
  veggies: { peas: 3, carrots: 4 }
}

selectTotal(state) // --> 10
```

*Next:* [selectors with args](/docs/usage/selectors-with-args.md)
