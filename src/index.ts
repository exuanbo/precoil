import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

type Callback<T> = (arg: T) => void

type Subscribe<T> = (event: symbol, callback: Callback<T>) => void
type Publish<T> = (event: symbol, data: T) => void

interface CustomContext<T> {
  subscribe?: Subscribe<T>
  publish?: Publish<T>
}

type Context<T> = React.Context<CustomContext<T>>
type Provider<T> = React.Provider<CustomContext<T>>

const context: Context<unknown> = createContext<CustomContext<unknown>>({})

export interface Atom<T> {
  default?: T
  symbol: symbol
}

export const atom = <T>(defaultState?: T): Atom<T> => ({
  default: defaultState,
  symbol: Symbol('atom')
})

export const usePrecoilState = <T>(atom: Atom<T>): [T, Callback<T>] => {
  const ctx = useContext(context as Context<T>)
  const [state, setState] = useState<T>(atom.default as T)

  useEffect(() => {
    ctx.subscribe?.(atom.symbol, (data: T) => setState(data))
  }, [])

  const set: Callback<T> = data => ctx.publish?.(atom.symbol, data)

  return [state, set]
}

interface Props {
  children: React.ReactNode
}

type Subs<T, K extends symbol> = Record<K, Array<Callback<T>> | undefined>

export const PrecoilRoot: FunctionComponent<Props> = <
  T,
  K extends symbol,
  R extends { subs: Subs<T, K> }
>({
  children
}: Props) => {
  /* eslint @typescript-eslint/consistent-type-assertions:
    ['error', {
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'allow-as-parameter'
    }] */
  const ref = useRef<R>({ subs: {} } as R)

  const subscribe = (event: K, cb: Callback<T>): void => {
    if (ref.current.subs[event] === undefined) {
      ref.current.subs[event] = []
    }
    ;(ref.current.subs[event] as Array<Callback<T>>).push(cb)
  }

  const publish = (event: K, data: T): void => {
    ref.current.subs[event]?.forEach(cb => cb(data))
  }

  const Provider = context.Provider as Provider<T>

  return React.createElement(
    Provider,
    {
      value: {
        subscribe: subscribe as Subscribe<T>,
        publish: publish as Publish<T>
      }
    },
    children
  )
}
