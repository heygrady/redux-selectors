# Selectors with args

One of the missing features of reselect is the ability to create a configurable selector. Reselect documents one potential solution using a curried selector. However, the reselect example shows placing the config arguments as the last call to the selector. Comfy redux-selectors allows you to create memoized, curried selectors where the _first_ call accepts the arguments and returns a selector funcion. The _second_ call accepts the state and returns a value.

In order to support composing selectors, it's important that the state be last. Consider examples of using redux's `compose` to apply several higher order components. In that scenario, a higher-order-component accepts configuration on the first call and a component on the second. With this in mind, you could consider a curried selector that accepts configuration and then state to be a _higher-order-selector_.

## You might not need it

There are some things to consider before resorting creating a selector with args. First, as the reselect docs point out, if you are hooking your selector up to `mapStateToProps`, you could rely on the `selector(state, props)` format to return values that are configured by props. Second, if you are configuring a selector using values that exist in the state, you might be able to get by with a dependent selector.

### Depending on `ownProps`

You may not need to provide curried args to your selector. By default, in order to support the signature of `mapStateToProps`, selectors accept a `props` arguments. There are some limitations to the props argument, namely, you can only pass props to the first selector when using [`composeSelectors`](/docs/api/composeSelectors.md)

Below you can see an example that uses the `ownProps` object that react-redux provides to `mapStateToProps`. This makes it easy to configure your selectors using react props. In the example below, notice the use of [`createPropsSelector`](/docs/api/createPropsSelector.md) to read values from `ownProps` instead of `state`.

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

const mapStateToProps = (state) => ({
  apples: selectApplesBySize(state)
})

mapStateToProps(state) // --> { apples: [{ id: 1, size: 'big' }] }
```

### Depending on curried `args`

For the cases when you don't want to rely on `ownProps` or `state` to configure your selector, you need to use `createSelectorWithArgs`. This allows you to pass a "creator function" that returns a selector. In the example below, you can see that the `size` argument is coming from the first call to the curried selector.

```js
import { createSelector, createSelectorWithArgs as withArgs } from '@comfy/redux-selectors'

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

const mapStateToProps = (state) => ({
  apples: selectApplesBySize('big')(state)
})

mapStateToProps(state) // --> { apples: [{ id: 1, size: 'big' }] }
```

### Depending on curried `args` and `ownProps`

You can also mix a curried selector with `ownProps`. In example below, notice that we're passing a value from `ownProps` into our curried selector. This has the benefit of flexibility. You can't always rely on `ownProps` existing as the second argument, for instance, if you are composing selectors with `composeSelectors`. By creating a curried function, you can have tight control over how your selector receives configuration.

```js
import { createSelector, createSelectorWithArgs as withArgs } from '@comfy/redux-selectors'

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

const mapStateToProps = (state, ownProps) => ({
  apples: selectApplesBySize(ownProps.size)(state)
})

mapStateToProps(state) // --> { apples: [{ id: 1, size: 'big' }] }
```

### Composing curried selectors

Here is a more advanced example that demonstrates how you might compose a curried selector with a dependent selector. This allows you to preconfigure your selector and then pass it into a helper function.

```js
import { createSelector, composeSelectors, createSelectorWithArgs as withArgs } from '@comfy/redux-selectors'

const selectApples = createSelector('fruit.apples')

const selectAppleById = withArgs(id => createSelector(
  selectApples,
  apples => apples.filter(apple => apple.id === id)
))

const selectSize = createSelector('size')

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
const ownProps = { id: 1 }

const mapStateToProps = (state, ownProps) => ({
  size: composeSelectors(
    selectAppleById(ownProps.id), // <-- preconfigure selector
    selectSize
  )
})

mapStateToProps(state) // --> { size: 'big' }
```

*Next:*
- [with `mapStateToProps`](/docs/usage/with-mapStateToProps.md)
- [composing selectors](/docs/usage/composing-selectors.md)
