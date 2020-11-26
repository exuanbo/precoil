import React, {
  Dispatch,
  SetStateAction,
  ReactNode,
  FunctionComponent,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react'

type SetState<T> = Dispatch<SetStateAction<T>>

type Subscribe = <T>(state: symbol, setState: SetState<T>) => void
type Publish = <T>(state: symbol, data: T) => void

interface CustomContext {
  subscribe: Subscribe
  publish: Publish
}

const context = createContext<Partial<CustomContext>>({})

interface Atom<T> {
  default?: T
  key: symbol
}

export const atom = <T>(defaultState?: T): Atom<T> => ({
  default: defaultState,
  key: Symbol('atom')
})

export const usePrecoilState = <T>(atom: Atom<T>): [T, SetState<T>] => {
  const ctx = useContext(context)
  const [state, setState] = useState<T>(atom.default as T)

  useEffect(() => {
    ctx.subscribe?.(atom.key, setState)
  }, [])

  const set: SetState<T> = data => ctx.publish?.(atom.key, data)

  return [state, set]
}

interface Props {
  children: ReactNode
}

interface Ref {
  subs: Map<symbol, Array<SetState<any>> | undefined>
}

export const PrecoilRoot: FunctionComponent<Props> = ({ children }: Props) => {
  const ref = useRef<Ref>({ subs: new Map() })

  const getCurrentSubs = (): Ref['subs'] => ref.current.subs

  const subscribe = <T>(state: symbol, setState: SetState<T>): void => {
    const subs = getCurrentSubs()
    subs.set(state, [...(subs.get(state) ?? []), setState])
  }

  const publish = <T>(state: symbol, data: T): void => {
    const subs = getCurrentSubs()
    subs.get(state)?.forEach(setState => setState(data))
  }

  return React.createElement(
    context.Provider,
    {
      value: {
        subscribe,
        publish
      }
    },
    children
  )
}
