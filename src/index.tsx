import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

type Subscribe<T> = (event: symbol, callback: (arg: T) => void) => void
type Publish<T> = (event: symbol, data: T) => void

interface CustomContext<T> {
  subscribe: Subscribe<T>
  publish: Publish<T>
}

type Context<T> = React.Context<CustomContext<T>>

type ContextProvider<T> = React.Provider<CustomContext<T>>

const context: Context<unknown> = createContext<CustomContext<unknown>>(
  {} as CustomContext<unknown>
)

export interface Atom<T> {
  default?: T
  symbol: symbol
}

export const atom = <T extends unknown>(defaultState?: T): Atom<T> => {
  return {
    default: defaultState,
    symbol: Symbol('atom')
  }
}

export const usePrecoilState = <T extends unknown>(
  atom: Atom<T>
): [T, (arg: T) => void] => {
  const ctx = useContext(context as Context<T>)
  const [state, setState] = useState<T>(atom.default as T)

  useEffect(() => {
    ctx.subscribe?.(atom.symbol, (data: T) => setState(data))
  }, [])

  const set = (data: T): void => {
    ctx.publish?.(atom.symbol, data)
  }

  return [state, set]
}

interface Props {
  children: React.ReactNode
}

type Subs<K extends symbol> = Record<K, Function[]>

export const PrecoilRoot: FunctionComponent<Props> = <
  K extends symbol,
  R extends { subs: Subs<K> },
  T
>({
  children
}: Props) => {
  const ref = useRef<R>({ subs: {} } as R)

  const subscribe = (event: K, callback: (arg: T) => void): void => {
    if (!Array.isArray(ref.current.subs[event])) {
      ref.current.subs[event] = []
    }
    ref.current.subs[event].push(callback)
  }

  const publish = (event: K, data: T): void => {
    if (!Array.isArray(ref.current.subs[event])) {
      return
    }
    for (const fn of ref.current.subs[event]) {
      fn(data)
    }
  }

  const Provider = context.Provider as ContextProvider<T>

  return (
    <Provider
      value={{
        subscribe: subscribe as Subscribe<T>,
        publish: publish as Publish<T>
      }}>
      {children}
    </Provider>
  )
}
