import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

type SetState<T> = (data: T) => void

// TODO Remove these `any`
type Subscribe<T> = (state: any, setState: SetState<T>) => void
type Publish<T> = (state: any, data: T) => void

interface CustomContext<T> {
  subscribe: Subscribe<T>
  publish: Publish<T>
}

type Context<T> = React.Context<CustomContext<T>>
type Provider<T> = React.Provider<CustomContext<T>>

const context = createContext<Partial<CustomContext<unknown>>>({})

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
    ctx.subscribe(atom.key, (data: T) => setState(data))
  }, [])

  const set: SetState<T> = data => ctx.publish(atom.key, data)

  return [state, set]
}

interface Props {
  children: React.ReactNode
}

interface Ref<T, K extends symbol> {
  subs: { [state in K]?: Array<SetState<T>> }
}

export const PrecoilRoot: FunctionComponent<Props> = <T, K extends symbol>({
  children
}: Props) => {
  const ref = useRef<Ref<T, K>>({ subs: {} })

  const subscribe: Subscribe<T> = (state: K, set: SetState<T>): void => {
    if (ref.current.subs[state] === undefined) {
      ref.current.subs[state] = []
    }
    ref.current.subs[state]?.push(set)
  }

  const publish: Publish<T> = (state: K, data: T): void => {
    ref.current.subs[state]?.forEach(set => set(data))
  }

  const Provider = context.Provider as Provider<T>

  return React.createElement(
    Provider,
    {
      value: {
        subscribe,
        publish
      }
    },
    children
  )
}
