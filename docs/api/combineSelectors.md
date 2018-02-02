# `combineSelectors(selectorMap)`

`combineSelectors` is designed to work with `mapStateToProps` as provided by react-redux's `connect` function. It simply maps selectors to keys and returns an object containing the values.

Notice that you can supply a mix of string and functional selectors. Each selector is passed through [`createStateSelector`](/docs/api/createStateSelector.md) before being executed.

## Basic usage

Here you can see a simple selector that will return an object. Notice below that `item` maps to a selector that returns `foo` and `other` maps to a selector that returns `baz`. You might notice that `'baz'` is a [path selector](/docs/usage/path-selectors.md).

It's important to note that `combineSelectors` accepts variable arguments. Meaning, by default it will pass both `state` and `ownProps` to every selector. See the next example if you are combining selectors that don't require access to `ownProps`.

```js
import { combineSelectors } from '@comfy/redux-selectors'

const mapStateToProps = combineSelectors({
  item: state => state.foo,
  other: 'baz'
})

// ---

const state = {
  foo: 'bar',
  baz: true
}

mapStateToProps(state) // => { item: 'bar', other: true }
```

## Ignoring `props`

Using `combineSelectors` directly with react-redux can surface some memoization issues. Consider the following.

In the example above, `connect` will presume that `combineSelectors` depends on both `state` and `ownProps`. However, if you _only_ specify `state` in your `mapStateToProps` function, `connect` will only recompute values for `state`, ignoring `ownProps`. This can yield some small performance gains if your selectors do not need `ownProps`.  If you are writing selectors that don't rely on `props` for any specific reason, you will want to wrap your `combineSelectors` call is a function that only accepts `state`.

The trick is that `connect` only knows to optimize your `mapStateToProps` by checking for the length of arguments provided. To take advantage of this, we need to present a version of `combineSelectors` that specifies only one argument.

Below you can see an example of the technique. Notice that the `mapStateToProps` only defines `state`, which means that react-redux will not recompute this selector unless `state` changes.

```js
import { combineSelectors } from '@comfy/redux-selectors'

const mapStateToProps = state => combineSelectors({
  item: 'department.produce.fruits.oranges'
})(state)

const state = {
  department: {
    produce: {
      fruits: {
        apples: 1,
        oranges: 2
      }
    }
  }
}

mapStateToProps(state) // => { item: 2 }
```

## Ignoring `props` with `withState`

Because ignoring props is a common pattern when working with react-redux, there is a helper function to make it easier. Notice below how we wrap `combineSelectors` with `withState`. This ensures that the outer function that `connect` sees will have only one defined argument. This will make react-redux more efficient with its cache in situations where your selectors do not ever use `ownProps`.

```js
import { combineSelectors, withState } from '@comfy/redux-selectors'

const mapStateToProps = withState(combineSelectors({
  item: 'department.produce.fruits.oranges'
}))

const state = {
  department: {
    produce: {
      fruits: {
        apples: 1,
        oranges: 2
      }
    }
  }
}

mapStateToProps(state) // => { item: 2 }
```

## Configuring `combineSelectors` with `withProps`

When you need to configure a selector based on `ownProps`, you can use [`withProps`](/docs/api/withProps.md). This is useful for times when you want to use configuration from `ownProps` to create your selectors, for instance, if you are using a configurable selector created by [`withArgs`](/docs/api/withArgs.md). Below you can see that the fruit selector will change based on the props that are passed.

```js
import { combineSelectors, withProps } from '@comfy/redux-selectors'

const mapStateToProps = withProps(props => combineSelectors({
  item: `department.produce.fruits.${props.type}`
}))

const state = {
  department: {
    produce: {
      fruits: {
        apples: 1,
        oranges: 2
      }
    }
  }
}
const ownProps = { type: 'oranges' }

mapStateToProps(state, ownProps) // => { item: 2 }
```
