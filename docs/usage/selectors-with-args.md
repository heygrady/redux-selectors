# Selectors with args

One of the missing features of reselect is the ability to create a configurable selector. Reselect documents one potential solution using a curried selector. However, the reselect example shows placing the config arguments as the last call to the selector. Comfy redux-selectors allows you to create memoized, curried selectors where the _first_ call accepts the arguments and returns a selector function. The _second_ call accepts the state and returns a value.

In order to support composing selectors, it's important that the state be last. Consider examples of using redux's `compose` to apply several higher order components. In that scenario, a higher-order-component accepts configuration on the first call and a component on the second.

## You might not need it

There are some things to consider before resorting creating a configurable selector. First, as the reselect docs point out, if you are hooking your selector up to `mapStateToProps` you could rely on the `selector(state, props)` format to return values that are configured by props. Second, if you are configuring a selector using values that exist in the state, you might be able to get by with a dependent selector.

### Depending on `ownProps`

By default, in order to support the signature of `mapStateToProps`, selectors accept a second `props` arguments.

There are some limitations to the props argument. A selector won't always be passed a second `props` argument. For instance, you can only pass `props` to the first selector when using [`composeSelectors`](/docs/api/composeSelectors.md).

Below you can see an example that uses the `ownProps` object that react-redux provides to `mapStateToProps`. This makes it easy to configure your selectors using react props. In the example below, notice the use of [`createPropsSelector`](/docs/api/createPropsSelector.md) to read values from `ownProps` instead of `state`.

```js
import { createSelector, createPropsSelector } from '@comfy/redux-selectors'

const selectApplesBySize = createSelector(
  'fruit.apples',
  createPropsSelector('size'),
  (apples, size) => apples.filter(apple => apple.size === size)
)
```

**Usage:**

```js
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

const mapStateToProps = (state, ownProps) => ({
  apples: selectApplesBySize(state, ownProps)
})

mapStateToProps(state, ownProps) // --> { apples: [{ id: 1, size: 'big' }] }
mapStateToProps(state, { size: 'small' }) // --> { apples: [{ id: 2, size: 'small' }] }
```

### Depending on `state`

You might be able to supply your arguments directly from the state. In this example, you can see that the `size` param is stored in the state. Notice how we're now selecting `size` from the `state` instead of `ownProps`.

```js
import { createSelector } from '@comfy/redux-selectors'

const selectApplesBySize = createSelector(
  'fruit.apples',
  'filter.size',
  (apples, size) => apples.filter(apple => apple.size === size)
)
```

**Usage:**

```js
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

const mapStateToProps = (state) => ({
  apples: selectApplesBySize(state)
})

mapStateToProps(state) // --> { apples: [{ id: 1, size: 'big' }] }
```

## Using `withArgs`

For the cases when you don't want to rely on `ownProps` or `state` to configure your selector, you need to use `withArgs`. This allows you to pass a "creator function" that returns a selector. In the example below, you can see that the `size` argument is coming from the first call to the curried selector.

```js
import { createSelector, withArgs } from '@comfy/redux-selectors'

const selectApplesBySize = withArgs(size => createSelector(
  'fruit.apples',
  apples => apples.filter(apple => apple.size === size)
))
```

**Usage:**

```js
const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  }
}

const mapStateToProps = (state) => ({
  apples: selectApplesBySize('big')(state)
})

mapStateToProps(state) // --> { apples: [{ id: 1, size: 'big' }] }
```

### Depending on curried `args` and `ownProps`

You can also mix a curried selector with `ownProps`. In example below, notice that we're passing a value from `ownProps` into our curried selector. This has the benefit of flexibility. You can't always rely on `ownProps` existing as the second argument, for instance, if you are composing selectors with `composeSelectors`. By creating a curried function, you can have tight control over how your selector receives configuration.

```js
import { createSelector, withArgs } from '@comfy/redux-selectors'

const selectApplesBySize = withArgs(size => createSelector(
  'fruit.apples',
  apples => apples.filter(apple => apple.size === size)
))
```

**Usage:**

```js
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

const mapStateToProps = (state, ownProps) => ({
  apples: selectApplesBySize(ownProps.size)(state)
})

mapStateToProps(state) // --> { apples: [{ id: 1, size: 'big' }] }
```

### Mixing `args` and `ownProps` with `USE_PROPS_AS_ARGS`

In order to formalize the mixing of configurable and props-based selectors, there is a special form of `withArgs` that will use the `props` as the args passed to the creator. This special case is useful when combined with [`combineSelectors`](/docs/api/combineSelectors.md) as it allows you to easily use the `props` to configure your selector when they are available and otherwise supply the configuration args yourself. This is kind of a "best of both worlds" approach.

Notice below how `size` comes from a props object.

```js
import { createSelector, withArgs } from '@comfy/redux-selectors'

const selectApplesBySize = withArgs(({ size } = {}) => createSelector(
  'fruit.apples',
  apples => apples.filter(apple => apple.size === size)
))
```

**Usage:**

```js
import { combineSelectors, USE_PROPS_AS_ARGS } from '@comfy/redux-selectors'

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

const mapStateToProps = combineSelectors({
  apples: selectApplesBySize(USE_PROPS_AS_ARGS)
})

mapStateToProps(state, ownProps) // --> { apples: [{ id: 1, size: 'big' }] }

// same result
selectApplesBySize(USE_PROPS_AS_ARGS)(state, ownProps) // --> [{ id: 1, size: 'big' }]
selectApplesBySize(ownProps)(state, ownProps) // --> [{ id: 1, size: 'big' }]
```

**Note:** There is a small memoizaton issue that is surfaced when using `USE_PROPS_AS_ARGS`. Namely, the internal selector memoization will be different if you pass only `state` versus passing both `state` and `props`. Because selectors are memoized by their *exact* arguments, passing only `state` is stored separately in the cache.

*Next:*
- [with `mapStateToProps`](/docs/usage/with-mapStateToProps.md)
- [composing selectors](/docs/usage/composing-selectors.md)
