## `withState(...selectors)`

```js
import { withState, combineSelectors } from '@comfy/redux-selectors'

const mapStateToProps = withState(combineSelectors({
  item: state => state.foo
}))

const state = {
  foo: 'bar'
}

mapStateToProps(state) // --> bar
```

## `withProps(...selectors)`

```js
import { withProps, combineSelectors } from '@comfy/redux-selectors'

const mapStateToProps = withProps(combineSelectors({
  item: state => state.bar
}))

const state = {
  foo: 'bar'
}
const ownProps = {
  bar: 'baz'
}

mapStateToProps(state, ownProps) // --> baz
```
