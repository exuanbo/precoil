import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

type SetState<T> = (data: T) => void

type Subscribe<T> = (state: symbol, setState: SetState<T>) => void
type Publish<T> = (state: symbol, data: T) => void

interface CustomContext<T> {
  subscribe?: Subscribe<T>
  publish?: Publish<T>
}

type Context<T> = React.Context<CustomContext<T>>
type Provider<T> = React.Provider<CustomContext<T>>

const context: Context<unknown> = createContext<CustomContext<unknown>>({})

export interface Atom<T> {
  default?: T
  key: symbol
}

export const atom = <T>(defaultState?: T): Atom<T> => ({
  default: defaultState,
  key: Symbol('atom')
})

export const usePrecoilState = <T>(atom: Atom<T>): [T, SetState<T>] => {
  const ctx = useContext(context as Context<T>)
  const [state, setState] = useState<T>(atom.default as T)

  useEffect(() => {
    ctx.subscribe?.(atom.key, (data: T) => setState(data))
  }, [])

  const set: SetState<T> = data => ctx.publish?.(atom.key, data)

  return [state, set]
}

interface Props {
  children: React.ReactNode
}

type Subs<T, K extends symbol> = Record<K, Array<SetState<T>> | undefined>

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

  const subscribe = (event: K, cb: SetState<T>): void => {
    if (ref.current.subs[event] === undefined) {
      ref.current.subs[event] = []
    }
    ;(ref.current.subs[event] as Array<SetState<T>>).push(cb)
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
