# `withState(...selectors)`

Helper function that wraps a selector to ensure that it only ever receives `state`.

```js
import { withState, combineSelectors } from '@comfy/redux-selectors'

const mapStateToProps = withState(combineSelectors({
  item: state => state.foo
}))

const state = {
  foo: 'bar'
}

mapStateToProps(state) // => bar
```
