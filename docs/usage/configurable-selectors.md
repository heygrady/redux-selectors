# Configurable selectors

Sometimes you need to pass some aditional configuration to your selectors. The [`withOptions`](/docs/api/withOptions.md) function allows you to create memoized, curried selectors where the _first_ call accepts the configuration arguments, the _second_ call accepts `state` and returns a value.

### Why configuration first, state last?

In order to support composing selectors, it's important that `state` be last. Consider examples of using redux's `compose` to apply several higher-order-components. For instance, react-redux's `connect` function is a higher-order-component. Like many higher-order-components, it accepts configuration on the first call and a _component_ on the second. There are numerous examples on the web, particularly react-router's `withRouter`, that show how to compose multiple higher-order-components together. This is possible because, by convention, higher-order-components are "configuration first".

Similarly, a configurable selector accepts configuration on the first call and `state` on the second call.

## Basic example

Consider this example of filtering a list of objects by size. You can see that `selectApplesBySize` is a curried function. The first call configures the selector and the second call returns the result.

This is a prime example of a function that should be memoized. We'll see below that `withOptions` makes it easy to memoize this type of selector.

```js
// a configurable selector
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

There are some things to consider before resorting creating a configurable selector. First, as the reselect docs point out, if you are hooking your selector up to `mapStateToProps` you could rely on the `selector(state, props)` format to return values that are configured by `props`. Second, if you are configuring a selector using values that exist in the state, you might be able to get by with a [dependent selector](/docs/usage/dependent-selectors.md).

### Depending on `ownProps` for configuration

In order to support the signature of `mapStateToProps`, selectors accept a second `props` arguments. This makes it easy to configure your selectors using props that come from react.

Below you can see an example that uses the `ownProps` object that react-redux's `connect` provides to `mapStateToProps`. Notice the use of [`createPropsSelector`](/docs/api/createPropsSelector.md) to read values from `ownProps` instead of `state`. In this case, there is no need for a configurable selector, because the configuration is coming from `ownProps` directly.

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

You might be able to supply your arguments directly from `state`. In this example we've added a `filter.size` to `state`. Notice how we're now selecting `size` from the `state` instead of `ownProps`. Again, there is no need for a configurable selector when configuration comes from `state`.

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

## Using `withOptions` for configuration

For the cases when you don't want to rely on `ownProps` or `state` to configure your selector, you can use [`withOptions`](/docs/api/withOptions.md). This allows you to pass a "creator function" that returns a selector. In the example below, you can see that the `size` argument is coming from the first call to the curried selector.

Notice that `selectApplesBySize` is memoized at both levels. The effect is that the inner selector is recreated every time `size` changes.

Importantly, the creator function is memoized using an internal `memoizeCreator` function. Unlike `memoizeSelector`, it memoizes your arguments by _value_. Meaning, `memoizeCreator` doesn't care if the arguments are literally the same object, only that they are the same value. This has a small benefit over relying on `ownProps`, which might change often while still containing the exact same values.

```js
import { createSelector, withOptions } from '@comfy/redux-selectors'

const selectApplesBySize = withOptions(size => createSelector(
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

### Using `withOptions` and `state` together

Even when you're using `withOptions`, you can still keep your configuration in the state. Consider this example where a `filter.size` has been added to `state`. Using `composeSelectors`, we can retrieve the filtered objects with a single call to the selector.

Notice how `selectApplesByFilter` below spreads the external args to both the outer `composeSelectors` and the inner selector returned by `selectApplesBySize`. This allows you to create a configurable selector that can get its configuration from anywhere, including `ownProps` (see further below).

```js
import { createSelector, composeSelectors, withOptions } from '@comfy/redux-selectors'

const selectSize = createSelector('filter.size')
const selectApplesBySize = withOptions(size => createSelector(
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

### Using `withOptions` and `ownProps` together

You can also mix a configurable selector with `ownProps`. In the example below, notice that we're passing a value from `ownProps` into our curried selector. By using a configurable selector, you can have tight control over how your selector receives configuration. This also allows you to memoize your selector more efficiently in some cases.

```js
import { createSelector, withOptions } from '@comfy/redux-selectors'

const selectApplesBySize = withOptions(size => createSelector(
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

### Using `withProps`

You can skip some of the ceremony of `withOptions` and create a selector that always uses `ownProps` for configuration. Below you can see that `selectApplesBySize` is nearly identical to the previous example. However, notice that we're using `withProps` instead of `withOptions`. The big difference is in how the selector is called. See below that the function signature is now `selectApplesBySize(state, ownProps)`.

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
