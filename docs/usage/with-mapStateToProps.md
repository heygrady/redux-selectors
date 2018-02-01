# With `mapStateToProps`

Typically, you use selectors to create props objects with a `mapStateToProps` function. This is a core feature of react-redux's `connect` function. Comfy redux-selectors has some helper functions that make it much easier to work with some of the peculiar edge cases of `mapStateToProps`.

For these examples, we're going to be using a configurable selector, `selectApplesBySize` and a path selector, `selectName`. We'll be importing them into our examples. There are important differences in how you would work with both types of selectors.

Notice that we're wrapping the inner selector in `withState` to prevent our inner selector from receiving the `props` argument.

```js
// selectors.js

import { createSelector, withArgs, withState } from '@comfy/redux-selectors'

export const selectApplesBySize = withArgs(size => withState(createSelector(
  'fruit.apples',
  apples => apples.filter(apple => apple.size === size)
)))

export const selectName = createSelector('app.currentUser.name')
```

For each example below, presume the `state` and `ownProps` looks like this:

```js
const state = {
  fruit: {
    apples: [
      { id: 1, size: 'big' },
      { id: 2, size: 'small' },
      { id: 3, size: 'medium' }
    ]
  }
  app: { currentUser: { name: 'Buddy' } }
}
const ownProps = { size: 'big' }
```

## Basic example

Here you can see a bare-bones example that isn't using any convenience functions. Our `mapStateToProps` function simply uses `state` and `ownProps` to create a props object. Most of the time, this format gives you the most control and utilizes the built-in memoization that `mapStateToProps` provides.

```js
import { selectApplesBySize, selectName } from './selectors'

const mapStateToProps = (state, ownProps) => ({
  apples: selectApplesBySize(ownProps.size)(state),
  name: selectName(state)
})

mapStateToProps(state, ownProps) // => { apples: [{ id: 1, size: 'big' }], name: 'Buddy' }
```

## Using `combineSelectors`

Notice that you could rewrite the `mapStateToProps` function above using [`combineSelectors`](/docs/api/combineSelectors.md). The main benefit is that you have the option to use path strings as well as selector functions (not shown here).

We need to wrap `selectApplesBySize` to pass the `size` from `ownProps` manually. Notice also that `selectName` is just a function reference. `combineSelectors` will call each of your selector functions for you! Under the hood, `combineSelectors` is memoized to prevent recalculating the props object if `state` and `ownProps` have not changed.

```js
import { combineSelectors } from '@comfy/redux-selectors'
import { selectApplesBySize, selectName } from './selectors'

const mapStateToProps = combineSelectors({
  apples: (state, ownProps) => selectApplesBySize(ownProps.size)(state),
  name: selectName
})

mapStateToProps(state, ownProps) // => { apples: [{ id: 1, size: 'big' }], name: 'Buddy' }
```

## Using `combineSelectors` and `USE_PROPS_AS_ARGS`

With configurable selectors you can pass `USE_PROPS_AS_ARGS` as your configuration, which instructs the selector to use the `props` argument as the configuration. Here we're passing a second argument that will select only the interesting values from `props`. In our case, we only want the `size` prop. If we didn't add this `'size'` selector then `selectApplesBySize` would receive the entire `ownProps` object as its configuration.

```js
import { combineSelectors, USE_PROPS_AS_ARGS } from '@comfy/redux-selectors'
import { selectApplesBySize, selectName } from './selectors'

const mapStateToProps = combineSelectors({
  apples: selectApplesBySize(USE_PROPS_AS_ARGS, 'size'),
  name: selectName
})

mapStateToProps(state, ownProps) // => { apples: [{ id: 1, size: 'big' }], name: 'Buddy' }
```

## Using `combineSelectors` and `withState`

Notice that you could rewrite the `mapStateToProps` function above using [`withState`](/docs/api/withState.md) and `combineSelectors`.  The trade-off is that we can no-longer rely on `ownProps` for configuration values.

Most functions in redux-selectors accept variable arguments, which causes react-redux to always pass `ownProps`. Under the hood, react-redux will inspect the function that you pass and cache it differently based on the number of arguments it accepts. In order to rely strictly on `state` and ignore `ownProps`, you can use `withState`, which simply returns a function that accepts _only_ a `state` argument. This can lead to a performance improvement in cases where your `state` is very stable and `ownProps` changes often.

Below, you can see that we're no long depending on `ownProps`. In cases where you don't need `ownProps`, you will achieve a slight performance boost by wrapping your `combineSelectors` with `withState`. Note: we've hard-coded `selectApplesBySize` to always be "big".

```js
import { combineSelectors, withState } from '@comfy/redux-selectors'
import { selectApplesBySize, selectName } from './selectors'

const mapStateToProps = withState(combineSelectors({
  apples: selectApplesBySize('big'),
  name: selectName
}))

mapStateToProps(state, ownProps) // => { apples: [{ id: 1, size: 'big' }], name: 'Buddy' }
```

## Using `combineSelectors` and `withState` (alternative)

Interestingly, `withState` can be used to wrap any type of selector. Here we're wrapping `selectName` in `withState` to prevent it from receiving a `props` argument. In this case that's not very useful because it's not a memoized selector. However, this pattern can be used to force a selector to memoize by state only, even when `combineSelectors` receives `ownProps`. This is useful in cases where some selectors require ownProps and other do not.

```js
import { combineSelectors, withState } from '@comfy/redux-selectors'
import { selectApplesBySize, selectName } from './selectors'

const mapStateToProps = combineSelectors({
  apples: selectApplesBySize(USE_PROPS_AS_ARGS, 'size'),
  name: withState(selectName)
})

mapStateToProps(state, ownProps) // => { apples: [{ id: 1, size: 'big' }], name: 'Buddy' }
```

## Wrapping `combineSelectors` in a creator

In cases where you are mixing configurable selectors with state selectors, you can also use a creator to improve memoization. If you wrap `combineSelectors` in a function as shown below, react-redux will recompute your selector every time `state` and `ownProps` are changed. However, our inner selector only needs to be recomputed when `state` changes. This means that we will benefit from wrapping our combined selector with `withArgs`.

Notice that we're defining a `creator` below. This is a configurable selector that accepts `props` on the first call and `state` on the second call. To drive the point home, we're wrapping `combineSelectors` with `withState` to ensure that it will only ever recompute when state changes.

Notice below that we're manually defining `props` for each call to `mapStateToProps`. Technically these two calls will have different props, even though they have the same values. Fortunately, `withArgs` is memoized by the real value, rather than doing an object equality check. With this setup, your selector will avoid being recomputed in cases where `state` is the same and `ownProps` is technically a different object but has the same values.

```js
import { combineSelectors, withArgs, withState, USE_PROPS_AS_ARGS } from '@comfy/redux-selectors'

const creator = withArgs(props => withState(combineSelectors({
  apples: selectApplesBySize(props.size),
  name: selectName
})))

const mapStateToProps = creator(USE_PROPS_AS_ARGS)

mapStateToProps(state, { size: 'big' }) // => { apples: [{ id: 1, size: 'big' }], name: 'Buddy' }
mapStateToProps(state, { size: 'big' }) // memoized
```

## Wrapping `combineSelectors` in `withProps`

If you want to use the props-creator pattern, you can save your self some trouble with `withProps`.

```js
import { combineSelectors, withProps, withState } from '@comfy/redux-selectors'

const mapStateToProps = withProps(props => withState(combineSelectors({
  apples: selectApplesBySize(props.size),
  name: selectName
})))

mapStateToProps(state, { size: 'big' }) // => { apples: [{ id: 1, size: 'big' }], name: 'Buddy' }
mapStateToProps(state, { size: 'big' }) // memoized
```
