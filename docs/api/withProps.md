# `withProps(creator)`

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

mapStateToProps(state, ownProps) // --> baz
```
