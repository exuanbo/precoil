import React, { useState, useEffect } from 'react'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>
type Subscription<T> = Set<SetState<T>>

interface Atom<T> {
  value: T
  subscription: Subscription<T>
}

export function atom<T>(initialValue: T): Atom<T>
export function atom<T>(initialValue?: T): Atom<T | undefined>

export function atom<T>(initialValue: T): Atom<T> {
  return {
    value: initialValue,
    subscription: new Set()
  }
}

const subscribe = <T>(
  setState: SetState<T>,
  subscription: Subscription<T>
): (() => void) => {
  subscription.add(setState)

  return () => {
    subscription.delete(setState)
  }
}

const publish = <T>(data: React.SetStateAction<T>, atom: Atom<T>): void => {
  const { value, subscription } = atom

  subscription.forEach(setState => {
    setState(data)
  })

  if (data instanceof Function) {
    atom.value = data(value)
    return
  }
  atom.value = data
}

export function useAtom<T>(atom: Atom<T>): [T, SetState<T>]
export function useAtom<T>(
  atom: Atom<T | undefined>
): [T | undefined, SetState<T | undefined>]

export function useAtom<T>(atom: Atom<T>): [T, SetState<T>] {
  const { value, subscription } = atom
  const [state, setState] = useState<T>(value)

  useEffect(() => subscribe(setState, subscription), [])

  const publishState: SetState<T> = data => {
    publish(data, atom)
  }

  return [state, publishState]
}
