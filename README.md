# Precoil

> A minimal state management library for React.

[![npm](https://img.shields.io/npm/v/precoil)](https://www.npmjs.com/package/precoil)
[![npm bundle size](https://img.shields.io/bundlephobia/min/precoil?label=bundle%20size)](https://bundlephobia.com/result?p=precoil)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/exuanbo/precoil/Node.js%20CI/main)](https://github.com/exuanbo/precoil/actions?query=workflow%3A%22Node.js+CI%22)
[![Codecov branch](https://img.shields.io/codecov/c/gh/exuanbo/precoil/main?token=8GJEGUF449)](https://codecov.io/gh/exuanbo/precoil/)
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

## Features

- Minimalistic API based on hooks
- No context provider needed
- Small bundle size

Try it on [CodeSandbox](https://codesandbox.io/s/precoil-bsmdd).

## Install

```sh
npm install precoil
```

## Usage

### atom

```js
import { atom } from 'precoil'

const textState = atom()
// textState: Atom<undefined>

const textStateWithDefault = atom('')
// textStateWithDefault: Atom<string>
```

```ts
const textState = atom<string>()
// textState: Atom<string | undefined>
```

### Atom.useState

```js
const textState = atom()

const Input = () => {
  const [text, setText] = textState.useState()
  return (
    <input
      value={text ?? ''}
      onChange={e => setText(e.currentTarget.value)}
    />
  )
}

const UpperCaseInput = () => {
  const [text] = textState.useState()
  return <p>Uppercase: {text && text.toUpperCase() || ''}</p>
}
```

### Atom.useReducer

```js
const countStore = atom({ count: 0 })

const Counter = () => {
  const [state, dispatch] = countStore.useReducer((prevState, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { count: prevState.count + 1 }
      case 'RESET':
        return { count: 0 }
      default:
        return prevState
    }
  })

  return (
    <>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>inc</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>reset</button>
    </>
  )
}

const MirrorCounter = () => {
  const [state] = countStore.useState()
  return <span>{state.count}</span>
}
```

### Atom.subscribe

```js
const countStore = atom({ count: 0 })

const unsubscribe = countStore.subscribe(state => {
  console.log(`State has been changed to { count: ${state.count} }`)
})

// At some point
unsubscribe()
```

### Atom.destroy

```js
const countStore = atom({ count: 0 })

// Remove all listeners
countStore.destroy()
```

## License

[MIT License](https://github.com/exuanbo/precoil/blob/main/LICENSE) © 2021 [Exuanbo](https://github.com/exuanbo)
