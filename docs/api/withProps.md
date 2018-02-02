# `withProps(creator)`

A helper function that passes `ownProps` to a creator function for advanced memoization control.

```js
import { withProps, combineSelectors } from '@comfy/redux-selectors'

const mapStateToProps = withProps(props => combineSelectors({
  item: state => props.bar
}))

const state = {
  foo: 'bar'
}
const ownProps = {
  bar: 'baz'
}

mapStateToProps(state, ownProps) // => baz
```
