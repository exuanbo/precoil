# Precoil

> A minimal state management library for React. Hmm, it's like Recoil.

[![npm](https://img.shields.io/npm/v/precoil)](https://www.npmjs.com/package/precoil)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/exuanbo/precoil/Node.js%20CI/main)](https://github.com/exuanbo/precoil/actions?query=workflow%3A%22Node.js+CI%22)
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

Try it on [CodeSandbox](https://codesandbox.io/s/precoil-bsmdd).

## Install

```sh
npm install precoil
```

## Usage

### PrecoilRoot

```js
import { PrecoilRoot } from 'precoil'

const App = () => (
  <PrecoilRoot>
    <TheRestOfYourApp />
  </PrecoilRoot>
)
```

### atom

```js
import { atom } from 'precoil'

export const textState = atom()
export const textStateWithDefault = atom('')
```

```ts
export const textState = atom<string>()
```

### usePrecoilState

```js
import { usePrecoilState } from 'precoil'
import { textState } from '../atoms'

const Input = () => {
  const [text, setText] = usePrecoilState(textState)
  return (
    <>
      <input
        onChange={e => setText(e.target.value)}
        value={text} />
    </>
  )
}

const UpperCaseInput = () => {
  const [text] = usePrecoilState(textState)
  return <span>{text.toUpperCase()}</span>
}
```

## API

```ts
import React, { FunctionComponent, ReactNode } from 'react'

interface Atom<T> {
  default?: T
  key: symbol
}
declare const atom: <T>(defaultState?: T | undefined) => Atom<T>

declare const usePrecoilState: <T>(
  atom: Atom<T>
) => [T | undefined, React.Dispatch<React.SetStateAction<T>>]

interface Props {
  children: ReactNode
}
declare const PrecoilRoot: FunctionComponent<Props>

export { PrecoilRoot, atom, usePrecoilState }
```

## Todo

- [ ] Unit testing
- [ ] `selector()`

## Credits

- [Recoil](https://recoiljs.org/)
- [getroomservice/use-anywhere](https://github.com/getroomservice/use-anywhere).

## License

[MIT License](https://github.com/exuanbo/precoil/blob/main/LICENSE) © 2020 [Exuanbo](https://github.com/exuanbo)
