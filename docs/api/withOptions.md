# `withOptions(creator)`

This is a convenience method for creating configurable selectors. Configurable selectors can accept arguments that affect the return value. For example, imagine a generic selector that can return an object based on an ID.

It is a memoized wrapper that allows you to provide a selector creator function that accepts arguments and returns a selector. Under the hood, `withOptions` simply memoizes the selectors the provided `creator` returns for the given `args`.

## Basic Usage

The `withOptions` function expects you to provide a "selector creator" function that accepts arguments and returns a selector function. Below you can see a contrived example for creating a generic selector that can be used to select any key from the state. The `withOptions` function will memoize your creator function so that multiple calls with the same args will re-use a previously created selector.

```js
import { withOptions } from '@comfy/redux-selectors'

const selectFoo = withOptions(key => state => state[key])

const state = { foo: 'bar' }
selectFoo('foo')(state) // => bar
```

**Note:** The above example does not benefit from memoization and could be better written as a plain function.

```js
// when you don't need memoization
const selectFoo = key => state => state[key]

const state = { foo: 'bar' }
selectFoo('foo')(state) // => bar
```

## Advanced Usage

Imagine that we have an array of objects in `state`. Below we will write a generic selector that returns objects from that array by ID.

You can see below that `selectOranges` is a normal selector that simply returns an array. `selectOrangeById` is a configurable selector. First you pass an `id` and then you pass `state`. The `withOptions` function memoizes the selector for each ID while `createSelector` memoizes the result.

`selectSizeById` showcases how configurable selectors can be composed. It depends on a fully memoized selector so it does not need to be memoized itself. [`composeSelectors`](/docs/api/composeSelectors.md) is used to return only the `size` attribute from the object.

```js
import { createSelector, composeSelectors, withOptions } from '@comfy/redux-selectors'

export const selectOranges = createSelector('oranges')
export const selectOrangeById = withOptions(id => createSelector(
  selectOranges,
  oranges => oranges.find(orange => orange.id === id)
))
export const selectSizeById = id => composeSelectors(
  selectOrangeById(id),
  'size'
)

// ---

const state = {
  oranges: [
    { id: 1, size: 'big' },
    { id: 2, size: 'medium' },
    { id: 3, size: 'small' }
  ]
}

selectOrangeById(3)(state) // => { id: 3, size: 'small' }
selectSizeById(3)(state)  // => small
```

## Filtering args:  `withOptions(creator, argFilter)`

Sometimes you want to ensure that the inner selector only receives some of the props. For instance, the inner selector will memoize itself using every argument it receives. If it will receive irrelevant arguments it can lead to cache misses. This is mostly useful when you want to use `ownProps` as the options. If you are using `ownProps` as args, you might enjoy [`withProps`](/docs/api/withProps.md).

In order to enable tight control over which props the inner selector receives, you can supply an optional "arg filter", like `withOptions(creator, argFilter)`. The arg filter is a function that receives an array of args and should return an new array of args. This has an impact on memoization. If your selector is receiving args it doesn't care about it may lead to unnecessary cache misses.

Below you can see three selectors created using `withOptions`: `selectFooPlus`, `selectProps` and `selectState`. Each of them is using the exact same creator function. The only difference is the use of an `argFilter`.

Notice that `selectFooPlus` works as expected, but passing `ownProps` can lead to a cache miss.

By contrast, `selectState` was defined with the `filterState` function, which will ensure that _only_ `state` is passed to the inner selector. This has the effect of improving memoization. You can see that `selectState` will return a memoized result regardless of the presence of `ownProps`.

Lastly, notice `selectProps`. It is defining an args filter that takes the second argument and makes it the first one! This has the effect of passing `ownProps` to the inner function as if it were `state`. You can see that `selectProps` will memoize correctly regardless of the existence of `state`!

```js
import { withOptions, filterState } from '@comfy/redux-selectors'

const creator = (plus = 0) => state => state.foo + plus
const selectFooPlus = withOptions(creator)
const selectProps = withOptions(
  creator,
  ([,props]) => [props]
)
const selectState = withOptions(
  creator,
  filterState
)

// ---

const state = {
  foo: 1
}
const ownProps = { foo: 100 }

selectFooPlus(1)(state) // => 2
selectFooPlus(1)(state, ownProps) // 2 (cache miss!)

selectProps(1, state, ownProps) // -> 101
selectProps(1, undefined, ownProps) // -> 101 (memoized)

selectState(1)(state) // => 2
selectState(1)(state, ownProps) // 2 (memoized)
```
