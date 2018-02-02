# `memoizeSelector(selector)`

Used internally by `createSelector` and `combineSelectors` for memoizing a selectors. Under the hood, this function use `WeakMap` to cache the value. It will only recompute values when `state` changes. It ignores state mutations. Although typically selectors only receive two arguments, `state` and `ownProps`, it will cache values with an infinite number of arguments. It memoizes each argument based on object equivalence, meaning, a cache hit requires the _exact_ same arguments be passed.

## Basic usage

`memoizeSelector` expects to receive selector function. It returns a selector that will memoize return values based on the provided arguments. Each argument provided to your selector must be a valid `WeakMap` key. The most common arguments a selector will receive are `state` and `ownProps`. However, you may pass an infinite number of valid arguments. You will likely see some performance issues if you have selectors with many thousands of arguments (ha ha), so don't do that.

In the example below we're memoizing a simple selector. Normally you would only memoize a selector that contained a loop of some sort. If you are using `createSelector` with a results function, or if you are using `combineSelectors`, your selector is already being memoized. You might rarely need to manually memoize selectors.

There are some things to keep in mind:

1. **mutaton is ignored** &mdash; if you change any property of an object it will still be the _same_ object. Because the `WeakMap` cache matches by the object itself, not any particular value in the object, you must pass a different object to get a different result.
2. **passing more args will trigger a cache miss** &mdash; if you pass a new argument, you will get a new result. Because the memoization function doens't know which arguments are being used to computer the value, it must compute a whole new value every time it see something new. Be careful, though! Notice example 4.
3. **passing "different" args will trigger a cache miss** &mdash; even if two objects have the same values, they are technically different objects and will trigger a cache miss. This is important to keep in mind when you are memoizing selectors in scenarios where either `state` or `ownProps` change frequently. There may be many cases where `state` or `ownProps` contain the same values but are technically different objects.
4. **passing the same args will return the same value forever** &mdash; while it may not be obvious at first, notice below how the initial call to `selectName(state)` effectively caches that result until that state is destroyed. In practice, this will rarely bite you. However, if you are in the habit of mutating the state rather than replacing it, `memoizeSelector` will ignore you... forever.

```js
import { memoizeSelector } from '@comfy/redux-selectors'

const selectName = memoizeSelector(state => state.name)

// ---

const state = { name: 'billy' }
const ownProps = { id: 1 }

// 1. mutaton is ignored
selectName(state) // => billy
state.name = 'sally'
selectName(state) // => billy

// 2. passing more args will trigger a cache miss
selectName(state, ownProps) // => sally
state.name = 'timmy' // mutation is _still_ ignored
selectName(state, ownProps) // => sally
selectName(state, ownProps, { extra: true }) // => timmy

// 3. passing "different" args will trigger a cache miss
selectName(state, { ...ownProps }) // => timmy

// 4. passing the same args will return the same value forever
const newState = { ...state }
selectName(newState) // => timmy
selectName(state) // => billy
newState.name = 'timmy' // mutation is _still_ ignored
selectName(newState) // => timmy
```
