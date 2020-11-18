# Precoil

> A minimal state management library for React. Hmm, it's like Recoil.

[![npm](https://img.shields.io/npm/v/precoil?style=flat-square)](https://www.npmjs.com/package/precoil)

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
import { textState } from '../index'

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

const DisplayInput = () => {
  const [text] = usePrecoilState(textState)
  return <span>{text}</span>
}
```

## API

```ts
import React, { FunctionComponent } from 'react'

interface Atom<T> {
    default?: T
    symbol: symbol
}
declare const atom: <T extends unknown>(defaultState?: T | undefined) => Atom<T>
declare const usePrecoilState: <T extends unknown>(atom: Atom<T>) => [T, (arg: T) => void]
interface Props {
    children: React.ReactNode
}
declare const PrecoilRoot: FunctionComponent<Props>

export { Atom, PrecoilRoot, atom, usePrecoilState }
```

## Todo

- [ ] Unit testing
- [ ] Documentation

## Credits

- [Recoil](https://recoiljs.org/)
- [getroomservice/use-anywhere](https://github.com/getroomservice/use-anywhere).

## License

[MIT License](https://github.com/exuanbo/precoil/blob/main/LICENSE) © 2020 [Exuanbo](https://github.com/exuanbo)
