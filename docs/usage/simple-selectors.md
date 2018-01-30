# Simple Selectors

The most immediate benefit of using redux-selectors is the ability to quickly create simple selectors from a selector string. Under the hood, redux-selectors uses [`get`](https://www.npmjs.com/package/lodash.get) from [lodash](https://lodash.com/docs#get). This enables you to create robust selectors with very little code.

If you pass only a single argument to `createSelector` it is passed thru [`createStateSelector`](/docs/api/createStateSelector.md). This has the effect of transforming string selectors into function selectors. Below, you can see an example of using `createSelector` with a string selector to select a value from the state.

Notice `selectOranges` and `selectOrangesSame` below. There is really no benefit or detriment to wrapping a selector function in `createSelector`. Under the hood, `createStateSelector` simply returns functions unchanged. In the example below, `selectOranges` and `selectOrangesSame` would be exactly equal. Similarly, you could accomplish the same thing with a string selector, as shown in `selectOrangesBest`.

```js
import { createSelector } '@comfy/redux-selectors'

// a string selector
export const selectApples = createSelector('fruit.apples')

// a function selector
export const selectOranges = state => state.fruit.oranges

// alternate examples
const selectOrangesSame = createSelector(selectOranges)
const selectOrangesBest = createSelector('fruit.oranges')

// ---

const state = {
  fruit: { apples: 1, oranges: 2 }
}

selectApples(state) // --> 1
selectOranges(state) // --> 2

selectOranges === selectOrangesSame // --> true
```

## Why string selectors are better

Using a string selector is preferred because it comes with some robustness that will avoid errors when the state isn't properly initialized. COnsider the following example. Notice that `selectApples` is, under the hood, using `lodash.get` which will return undefined when a key is not found. By contrast, `selectOranges` will attempt to read an undefined key which throws an error.

If you prefer the behavior of throwing on undefined, then you might prefer to use functional selectors over string selectors.

```js
import { createSelector } '@comfy/redux-selectors'

export const selectApples = createSelector('fruit.apples')
export const selectOranges = state => state.fruit.oranges

// ---

const state = {} // whoops! empty state

selectApples(state) // --> undefined
selectOranges(state) // --> throws
```

## Doing it manually

### With lodash get
In reality, `createSelector` isn't doing anything particularly special. It's a convenience function for doing something you could just as easily do yourself. Below you can see an example that doesn't use redux-selectors at all.

```js
import get from 'lodash.get'

// you can use lodash get yourself
export const selectApplesManually = state => get(state, 'fruit.apples')

// ---

const state = {
  fruit: { apples: 1, oranges: 2 }
}

selectApples(state) // --> 1
```

### With `createStateSelector(selector)`

As mentioned above, when you pass only one argument `createSelector` acts as a thin wrapper around `createStateSelector`. In turn, `createStateSelector` is just a thin wrapper around `lodash.get`. In the example below, you can see that `createStateSelector` isn't any different than `createSelector`.

Notice `selectOranges` is a function selector. There is really no benefit or detriment to wrapping a selector function in `createStateSelector`. Many of the functions in redux-selectors pass selectors through `createStateSelector` in order to transform string selectors into functional selectors.

```js
import { createStateSelector } '@comfy/redux-selectors'

// a string selector
export const selectApples = createStateSelector('fruit.apples')

// a function selector
export const selectOranges = createStateSelector(state => state.fruit.oranges)

// ---

const state = {
  fruit: { apples: 1, oranges: 2 }
}

selectApples(state) // --> 1
selectOranges(state) // --> 2
```

*Next:* [dependent selectors](/docs/usage/dependent-selectors.md)
