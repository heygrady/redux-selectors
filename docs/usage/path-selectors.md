# Path Selectors

The most immediate benefit of using redux-selectors is the ability to quickly create "path selectors". Under the hood, redux-selectors uses `get` function with the same API as [lodash](https://lodash.com/docs#get). Basically, if you pass a `path`, like `get(state, path)`, it will return that value or return undefined. Importantly, `get` returns `undefined` instead of throwing an error if it can't resolve the path..

If you pass only a single argument to `createSelector`, like `createSelector(path)`, it will return selector. Under the hood, any selector you provide to `createSelector` is wrapped by [`createStateSelector`](/docs/api/createStateSelector.md). This has the effect of transforming paths into functional selectors.

In order to support path selectors, redux-selectors commonly passes selectors through [`createStateSelector`](/docs/api/createStateSelector.md), which will convert paths into selector functions (and blindly return all other values). Because of this, you can use paths to create selectors on-the-fly with `createSelector`, [`composeSelectors`](/docs/api/composeSelectors.md) and [`combineSelectors`](/docs/api/combineSelectors.md).

Below, you can see an example of using `createSelector` with a path string to select a value from the state.

Notice that `selectApples` is a string selector and that `selectOranges` is a functional selector. Typically, there is no need to wrap a functional selector in `createSelector`, but there's no harm in doing it either. Also note that `get` allows paths to be in array format as well. You can see that `selectBananas` supplies the path as an array.

```js
import { createSelector } '@comfy/redux-selectors'

export const selectApples = createSelector('fruit.apples') // string path
export const selectOranges = state => state.fruit.oranges
export const selectBananas = createSelector(['fruit', 'bananas']) // array path
export const selectWhoops = createSelector('fruit', 'bananas')

// ---

const state = {
  fruit: { apples: 1, oranges: 2, bananas: 3 }
}

selectApples(state) // => 1
selectOranges(state) // => 2
selectBananas(state) // => 3
selectWhoops(state) // => 3 (why does this work?)
```

**Note:** There is an overloaded version of `createSelector` that accepts a list of selectors and a "results function". In the example above, `selectWhoops` is accidentally using this format. Technically, `selectWhoops` is selecting `fruit` from `state` and passing the result to a function that reads `bananas` from the result. Also note that `selectWhoops` is memoized. This is called a ["dependent selector"](/docs/usage/dependent-selectors.md) and you can read more about it in the docs.

## Why use paths instead of pure functions?

A path selector is created using `get`, which will avoid errors that occur when the state isn't properly initialized.

Consider the following example. Notice that `selectApples` returns `undefined` when a key is not found. By contrast, `selectOranges` will attempt to read an undefined key, which throws an error. If you prefer the behavior of throwing on undefined, then you might prefer to use functional selectors over path selectors.

```js
import { createSelector } '@comfy/redux-selectors'

export const selectApples = createSelector('fruit.apples')
export const selectOranges = state => state.fruit.oranges

// ---

const state = {} // whoops! empty state

selectApples(state) // => undefined
selectOranges(state) // => throws
```

### Passing a function as a selector

You can also pass a function to `createSelector`, although it's not particularly useful. There's no harm in doing this either.

Notice in the example below that `selectOranges` and `selectOrangesToo` are the _exact same function_. Under the hood, the `createSelector` function simply returns a passed function. You can read more about how [`createStateSelector`](/docs/api/createStateSelector.md) works to see why.

```js
import { createSelector } from '@comfy/redux-selectors'

// these are equivalent
const selectOranges = state => state.fruit.oranges
const selectOrangesToo = createSelector(selectOranges)

selectOranges === selectOrangesToo // => true
```

## Doing it manually

In terms of creating selectors from paths, `createSelector(path)` isn't doing anything particularly special. It's a convenience function for doing something you could just as easily do yourself.

### With lodash get

Below you can see an example that doesn't use redux-selectors at all. This basic format is what is created inside the [`createStateSelector`](/docs/api/createStateSelector.md).

```js
import get from 'lodash.get'

export const selectApples = state => get(state, 'fruit.apples')

// ---

const state = {
  fruit: { apples: 1, oranges: 2 }
}

selectApples(state) // => 1
```

### With `createStateSelector(selector)`

As mentioned above, when you pass only one argument to `createSelector` it acts as a thin wrapper around `createStateSelector`. In turn, `createStateSelector` is just a thin wrapper around `lodash.get`. In the example below, you can see that, with a single argument, `createStateSelector` doesn't behave any different than `createSelector`.

Notice that `selectOranges` is a function selector. There is really no benefit or detriment to wrapping a selector function in `createStateSelector`. Many of the functions in redux-selectors pass selectors through `createStateSelector` in order to transform path strings into functional selectors.

```js
import { createStateSelector } '@comfy/redux-selectors'

export const selectApples = createStateSelector('fruit.apples')
export const selectOranges = createStateSelector(state => state.fruit.oranges)

// ---

const state = {
  fruit: { apples: 1, oranges: 2 }
}

selectApples(state) // => 1
selectOranges(state) // => 2
```

*Next:* [dependent selectors](/docs/usage/dependent-selectors.md)
