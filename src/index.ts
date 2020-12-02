import React, { useState, useEffect } from 'react'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

type Actions = Set<SetState<any>>
type Subscriptions = Map<symbol, Actions | undefined>

const subscriptions: Subscriptions = new Map()

const getActions = (key: symbol): Actions => {
  if (!subscriptions.has(key)) {
    subscriptions.set(key, new Set())
  }
  return subscriptions.get(key) as Actions
}

const subscribe = <T>(key: symbol, setState: SetState<T>): (() => void) => {
  const getCurrentActions = (): Actions => getActions(key)
  getCurrentActions().add(setState)

  return () => {
    const actions = getCurrentActions()
    actions.delete(setState)
    if (actions.size === 0) {
      subscriptions.delete(key)
    }
  }
}

const publish = <T>(key: symbol, data: T): void => {
  getActions(key).forEach(setState => setState(data))
}

interface Atom<T> {
  initialValue: T
  key: symbol
}

export function atom<T>(initialValue: T): Atom<T>
export function atom<T>(initialValue?: T): Atom<T | undefined>

export function atom<T>(initialValue: T): Atom<T> {
  return {
    initialValue,
    key: Symbol('atom')
  }
}

export function useAtom<T>(atom: Atom<T>): [T, SetState<T>]
export function useAtom<T>(
  atom: Atom<T | undefined>
): [T | undefined, SetState<T | undefined>]

export function useAtom<T>(atom: Atom<T>): [T, SetState<T>] {
  const { initialValue, key } = atom
  const [state, setState] = useState<T>(initialValue)

  useEffect(() => subscribe(key, setState), [])

  const publishState: SetState<T> = data => {
    publish(key, data)
  }

  return [state, publishState]
}
