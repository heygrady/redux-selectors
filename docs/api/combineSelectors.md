# `combineSelectors(selectorMap)`

`combineSelectors` is designed to work with `mapStateToProps` as provided by react-redux's `connect` function. It simply maps selectors to keys and returns an object containing the values.

Notice that you can supply a mix of string and functional selectors. Each selector is passed through [`createStateSelector`](/docs/api/createStateSelector.md) before being executed.

## Basic usage

```js
import { combineSelectors } from '@comfy/redux-selectors'
const mapStateToProps = combineSelectors({
  item: state => state.foo,
  other: 'baz'
})

const state = {
  foo: 'bar',
  baz: true,
  other: false
}

mapStateToProps(state) // --> { item: 'bar', other: true }
```

## Ignoring `props`

react-redux has some built-in optimizations that will enhance performance if you only specify the `state` argument in your `mapStateToProps` function. If you are writing selectors that don't rely on `props` for any specific reason, you will want to wrap your combineSelectors call is a function that only accepts `state`.

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

mapStateToProps(state) // --> { item: 2 }
```
