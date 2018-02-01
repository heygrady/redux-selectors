# Selectors with args

Comfy redux-selectors allows you to create memoized, curried selectors where the _first_ call accepts the arguments and returns a selector function. The _second_ call accepts the state and returns a value.

In order to support composing selectors, it's important that the state be last. Consider examples of using redux's `compose` to apply several higher-order-components. In that scenario, a higher-order-component accepts configuration on the first call and a component on the second. Similarly, a configurable selector accepts configuration on the first call and state on the second call.

## Basic example

Consider this example of filtering a list of objects by size. You can see that `selectApplesBySize` is a curried function. The first call configures the selector and the second call returns the result.

This is a prime example of a function that should be memoized. We'll see below that `withArgs` makes it easy to memoize this type of selector.

```js
const selectApplesBySize = size => state => {
  const apples = state.fruit.apples
  return apples.filter(apple => apple.size === size)
}

// ---

const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  }
}

selectApplesBySize('big')(state) // => [{ id: 1, size: 'big' }]
```

## You might not need it

There are some things to consider before resorting creating a configurable selector. First, as the reselect docs point out, if you are hooking your selector up to `mapStateToProps` you could rely on the `selector(state, props)` format to return values that are configured by `props`. Second, if you are configuring a selector using values that exist in the state, you might be able to get by with a dependent selector.

### Depending on `ownProps` for configuration

In order to support the signature of `mapStateToProps`, selectors accept a second `props` arguments. This makes it easy to configure your selectors using react props.

Below you can see an example that uses the `ownProps` object that react-redux provides to `mapStateToProps`. Notice the use of [`createPropsSelector`](/docs/api/createPropsSelector.md) to read values from `ownProps` instead of `state`.

```js
import { createSelector, createPropsSelector } from '@comfy/redux-selectors'

const selectApplesBySize = createSelector(
  'fruit.apples',
  createPropsSelector('size'),
  (apples, size) => apples.filter(apple => apple.size === size)
)

// ---

const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  }
}
const ownProps = { size: 'big' }

selectApplesBySize(state, ownProps) // => [{ id: 1, size: 'big' }]
```

### Depending on `state` for configuration

You might be able to supply your arguments directly from the state. Notice how we're now selecting `size` from the `state` instead of `ownProps`.

```js
import { createSelector } from '@comfy/redux-selectors'

const selectApplesBySize = createSelector(
  'fruit.apples',
  'filter.size',
  (apples, size) => apples.filter(apple => apple.size === size)
)

// ---

const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  },
  filter: { size: 'big' }
}

selectApplesBySize(state) // => [{ id: 1, size: 'big' }]
```

## Using `withArgs` for configuration

For the cases when you don't want to rely on `ownProps` or `state` to configure your selector, you need to use [`withArgs`](/docs/api/withArgs.md). This allows you to pass a "creator function" that returns a selector. In the example below, you can see that the `size` argument is coming from the first call to the curried selector.

Notice that `selectApplesBySize` is memoized at both levels. The effect is that the inner selector is recreated every time `size` changes.

Importantly, the creator function is memoized using an internal `memoizeCreator` function. Unlike `memoizeSelector`, it memoizes your arguments by value. Meaning, `memoizeCreator` doesn't care if the arguments are literally the same object, only that they are the same value. This has a small benefit over relying on `ownProps`, which might change often while still containing the exact same values.

```js
import { createSelector, withArgs } from '@comfy/redux-selectors'

const selectApplesBySize = withArgs(size => createSelector(
  'fruit.apples',
  apples => apples.filter(apple => apple.size === size)
))

// ---

const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  }
}

selectApplesBySize('big')(state) // => [{ id: 1, size: 'big' }]
```

### Using `withArgs` and `state` together

Even when you're using `withArgs`, you can still keep your configuration in the state. Consider this example where a `filter.size` has been added to the state. Using `composeSelectors`, we can retrieve the filtered objects with a single call to the selector.

Notice how `selectApplesByFilter` below spreads the external args to both the outer `composeSelectors` and the inner selector returned by `selectApplesBySize`.

```js
import { createSelector, composeSelectors, withArgs } from '@comfy/redux-selectors'

const selectSize = createSelector('filter.size')
const selectApplesBySize = withArgs(size => createSelector(
  'fruit.apples',
  apples => apples.filter(apple => apple.size === size)
))
const selectApplesByFilter = (...args) => composeSelectors(
  selectSize,
  selectApplesBySize,
  selector => selector(...args)
)(...args)

// ---

const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  },
  filter: { size: 'big' }
}

selectApplesByFilter(state) // => [{ id: 1, size: 'big' }]
```

### Using `withArgs` and `ownProps` together

You can also mix a configurable selector with `ownProps`. In the example below, notice that we're passing a value from `ownProps` into our curried selector. By creating a curried function, you can have tight control over how your selector receives configuration. This also allows you to memoize your selector efficiently.

```js
import { createSelector, withArgs } from '@comfy/redux-selectors'

const selectApplesBySize = withArgs(size => createSelector(
  'fruit.apples',
  apples => apples.filter(apple => apple.size === size)
))

// ---

const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  }
}
const ownProps = { size: 'big' }

selectApplesBySize(ownProps.size)(state) // => [{ id: 1, size: 'big' }]
```

### Using `withArgs` and `ownProps` with `USE_PROPS_AS_ARGS`

In order to formalize configurable, props-based selectors, there is a special form of `withArgs` that will use the `props` as the args passed to the creator. This special case is useful when combined with [`combineSelectors`](/docs/api/combineSelectors.md) as it allows you to easily use the `props` to configure your selector when they are available and otherwise supply the configuration args yourself. This is kind of a "best of both worlds" approach.

Notice below how `size` now comes from a props object. The `USE_PROPS_AS_ARGS` constant tells `withArgs` to use the `ownProps` as the configuration. Under the hood, this tells `withArgs` to wrap itself in `withProps`.

```js
import { createSelector, withArgs, withState } from '@comfy/redux-selectors'

const selectApplesBySize = withArgs(({ size } = {}) => withState(createSelector(
  'fruit.apples',
  apples => apples.filter(apple => apple.size === size)
)))

// ---

import { USE_PROPS_AS_ARGS } from '@comfy/redux-selectors'

const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  }
}
const ownProps = { size: 'big' }

selectApplesBySize(USE_PROPS_AS_ARGS)(state, ownProps) // => [{ id: 1, size: 'big' }]
selectApplesBySize(ownProps)(state) // => [{ id: 1, size: 'big' }]
```

**Note:** There is a small memoizaton issue that is surfaced when using `USE_PROPS_AS_ARGS`. Namely, the internal selector memoization will be different if you pass only `state` versus passing both `state` and `props`. Because selectors are memoized by their *exact* arguments, passing only `state` is stored separately in the cache.

Notice above that the inner selector is wrapped in `withState` to prevent it from ever receiving `props`, which will prevent it from recomputing the selector unnecessarily. This is considered safe because `withArgs` will recompute the selector any time `size` changes.

### Using `withProps`

You can skip some of the ceremony of `withArgs` and create a selector that always uses `ownProps` for configuration. Below you can see that `selectApplesBySize` is nearly identical to the previous example. However, notice that we're using `withProps` instead of `withArgs`. The big difference is in how the selector is called. See below that the function signature is now `selectApplesBySize(state, ownProps)`.

```js
import { createSelector, withProps, withState } from '@comfy/redux-selectors'

const selectApplesBySize = withProps(({ size } = {}) => withState(createSelector(
  'fruit.apples',
  apples => apples.filter(apple => apple.size === size)
)))

// ---

const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  }
}
const ownProps = { size: 'big' }

selectApplesBySize(state, ownProps) // => [{ id: 1, size: 'big' }]
```

*Next:*
- [with `mapStateToProps`](/docs/usage/with-mapStateToProps.md)
- [composing selectors](/docs/usage/composing-selectors.md)
