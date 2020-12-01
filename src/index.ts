import React, { useContext, useState, useEffect } from 'react'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

type Actions = Set<SetState<any>>
type Subs = Map<symbol, Actions | undefined>

type Unsubscribe = () => void
type Subscribe = <T>(state: symbol, setState: SetState<T>) => Unsubscribe
type Publish = <T>(state: symbol, data: T) => void

interface Precoil {
  readonly _subs: Subs
  subscribe: Subscribe
  publish: Publish
}

const precoil: Precoil = {
  _subs: new Map(),

  subscribe<T>(state: symbol, setState: SetState<T>) {
    const { _subs: subs } = this
    const getActions = (): Actions | undefined => subs.get(state)
    const actions = getActions()

    if (actions === undefined) {
      subs.set(state, new Set([setState]))
    } else {
      actions.add(setState)
    }

    return () => {
      const curActions = getActions()
      curActions!.delete(setState)
      if (curActions!.size === 0) {
        subs.delete(state)
      }
    }
  },

  publish<T>(state: symbol, data: T) {
    this._subs.get(state)!.forEach(setState => setState(data))
  }
}

const precoilContext = React.createContext(precoil)

interface Atom<T> {
  default: T
  key: symbol
}

export function atom<T>(defaultValue: T): Atom<T>
export function atom<T>(): Atom<T | undefined>

export function atom<T>(defaultValue?: T): Atom<T | undefined> {
  return {
    default: defaultValue,
    key: Symbol('atom')
  }
}

export function useAtom<T>(atom: Atom<T>): [T, SetState<T>]
export function useAtom<T>(
  atom: Atom<T | undefined>
): [T | undefined, SetState<T | undefined>]

export function useAtom<T>(atom: Atom<T>): [T, SetState<T>] {
  const ctx = useContext(precoilContext)
  const [state, setState] = useState<T>(atom.default)

  useEffect(() => ctx.subscribe(atom.key, setState), [])

  const publishState: SetState<T> = data => {
    ctx.publish(atom.key, data)
  }

  return [state, publishState]
}
