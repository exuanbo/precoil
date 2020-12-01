# Precoil

> A minimal state management library for React. Hmm, it's like Recoil.

[![npm](https://img.shields.io/npm/v/precoil)](https://www.npmjs.com/package/precoil)
[![npm bundle size](https://img.shields.io/bundlephobia/min/precoil?label=bundle%20size)](https://bundlephobia.com/result?p=precoil)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/exuanbo/precoil/Node.js%20CI/main)](https://github.com/exuanbo/precoil/actions?query=workflow%3A%22Node.js+CI%22)
[![Codecov branch](https://img.shields.io/codecov/c/gh/exuanbo/precoil/main?token=8GJEGUF449)](https://codecov.io/gh/exuanbo/precoil/)
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

## Features

- Shares state between components without rerendering the entire tree.
- Doesn't require wrapping your app in context provider.

Try it on [CodeSandbox](https://codesandbox.io/s/precoil-bsmdd).

## Install

```sh
npm install precoil
```

## Usage

### atom

```js
import { atom } from 'precoil'

export const textState = atom()
export const textStateWithDefault = atom('')
```

```ts
export const textState = atom<string>()
// textState: string | undefined
```

### useAtom

```js
import { useAtom } from 'precoil'
import { textState } from '../atoms'

const Input = () => {
  const [text, setText] = useAtom(textState)
  return (
    <input
      value={text || ''}
      onChange={e => setValue(e.currentTarget.value)}
    />
  )
}

const UpperCaseInput = () => {
  const [text] = useAtom(textState)
  return <p>Uppercase: {text && text.toUpperCase() || ''}</p>
}
```

## API

```ts
import React from 'react'

interface Atom<T> {
  default: T
  key: symbol
}
declare function atom<T>(defaultValue: T): Atom<T>
declare function atom<T>(): Atom<T | undefined>

declare type SetState<T> = React.Dispatch<React.SetStateAction<T>>

declare function useAtom<T>(atom: Atom<T>): [T, SetState<T>]
declare function useAtom<T>(
  atom: Atom<T | undefined>
): [T | undefined, SetState<T | undefined>]

export { atom, useAtom }
```

## Todo

- [ ] Documentation

## License

[MIT License](https://github.com/exuanbo/precoil/blob/main/LICENSE) © 2020 [Exuanbo](https://github.com/exuanbo)
