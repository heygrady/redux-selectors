# Dependent selectors

A dependent selector is a selector that computes a result from one or more selectors. This functionality is inspired by reselect. Like reselect, you simply need to pass two or more functions to [`createSelector`](/docs/api/createSelector), like `createSelector(...selectors, resultsFunc)`. The last function is treated as a "results function" while every other function is treated as a "dependent selector". The values from each dependent selector become the arguments for the results function.

A results function receives the value from each dependent selector, like `resultsFunc(...results)`. You can see it in action below to make things more clear.

Unlike path selectors, dependent selectors are memoized using [`memoizeSelector`](/docs/api/memoizeSelector.md). This means that the value returned from the results function is cached until the state changes. This can improve performance in cases where `state` seldom changes or when the dependent selectors are difficult to compute.

For convenience, `createSelector` supports both functions and path strings. This enables you to easily create robust selectors on-the-fly if needed. Under the hood, each selector is passed thru [`createStateSelector`](/docs/api/createStateSelector.md) in order to transform path strings into functional selectors.

Notice in the example below that you can use a mix of selectors and paths for your dependent selectors. The result of each selector is pass as an arg to the results function. You can see below that the results function receives `apples, oranges, peas, carrots`, one argument for each selector. Also notice how a path, `'veggies.peas'` is used to select `peas` and how an inline function is used to select `carrots`.

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

selectTotal(state) // => 10
```

### Using get and reselect instead

Comfy redux-selectors isn't doing anything particularly special. You can accomplish the same result with reselect. Compare the following example that uses reselect and get. Just like redux-selectors, reselect will memoize your dependent selector.

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

selectTotal(state) // => 10
```

*Next:* [Configurable selectors](/docs/usage/configurable-selectors.md)
