import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

type Subscribe = <T>(state: symbol, setState: SetState<T>) => void
type Unsubscribe = () => void
type Publish = <T>(state: symbol, data: T) => void

interface CustomContext {
  subscribe: Subscribe
  publish: Publish
}

const context = React.createContext<Partial<CustomContext>>({})

interface Atom<T> {
  default: T
  key: symbol
}

export function atom<T>(defaultState: T): Atom<T>
export function atom<T>(): Atom<T | undefined>

export function atom<T>(defaultState?: T): Atom<T | undefined> {
  return {
    default: defaultState,
    key: Symbol('atom')
  }
}

export function usePrecoilState<T>(atom: Atom<T>): [T, SetState<T>]
export function usePrecoilState<T>(
  atom: Atom<T | undefined>
): [T | undefined, SetState<T | undefined>]

export function usePrecoilState<T>(atom: Atom<T>): [T, SetState<T>] {
  const ctx = useContext(context)
  const [state, setState] = useState<T>(atom.default)

  useEffect(() => ctx.subscribe!(atom.key, setState), [])

  const publishState: SetState<T> = data => {
    ctx.publish!(atom.key, data)
  }

  return [state, publishState]
}

interface Props {
  children: ReactNode
}

type Actions = Set<SetState<any>>
type Subs = Map<symbol, Actions | undefined>

export const PrecoilRoot: FunctionComponent<Props> = ({ children }: Props) => {
  const ref = useRef<Subs>(new Map())

  const getCurrentSubs = (): Subs => ref.current

  const subscribe = <T>(state: symbol, setState: SetState<T>): Unsubscribe => {
    const subs = getCurrentSubs()
    const getActions = (): Actions | undefined => subs.get(state)
    const actions = getActions()
    if (actions === undefined) {
      subs.set(state, new Set([setState]))
      return () => {
        getActions()!.delete(setState)
      }
    }
    actions.add(setState)
    return () => {
      actions.delete(setState)
    }
  }

  const publish = <T>(state: symbol, data: T): void => {
    const subs = getCurrentSubs()
    subs.get(state)!.forEach(setState => setState(data))
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
