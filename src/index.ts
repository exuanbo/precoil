import React, { useState, useEffect, useReducer } from 'react'

type DispatchSetStateAction<T> = React.Dispatch<React.SetStateAction<T>>
type DispatchReducerAction<T> = React.Dispatch<
  React.ReducerAction<React.Reducer<T, any>>
>

type SetStateActionSubscription<T> = Set<DispatchSetStateAction<T>>
type ReducerActionSubscription<T> = Set<DispatchReducerAction<T>>
type Subscription<T> =
  | SetStateActionSubscription<T>
  | ReducerActionSubscription<T>

interface Atom<T> {
  value: T
  setStateSubscription: SetStateActionSubscription<T>
  reducerSubscription: ReducerActionSubscription<T>
}

export function atom<T>(initialValue: T): Atom<T>
export function atom<T>(initialValue?: T): Atom<T | undefined>

export function atom<T>(initialValue: T): Atom<T> {
  return {
    value: initialValue,
    setStateSubscription: new Set(),
    reducerSubscription: new Set()
  }
}

const subscribe = <T>(
  dispatch: DispatchSetStateAction<T> | DispatchReducerAction<T>,
  subscription: Subscription<T>
): (() => void) => {
  subscription.add(dispatch)

  return () => {
    subscription.delete(dispatch)
  }
}

export function useAtom<T>(atom: Atom<T>): [T, DispatchSetStateAction<T>]
export function useAtom<T>(
  atom: Atom<T | undefined>
): [T | undefined, DispatchSetStateAction<T>]

export function useAtom<T>(atom: Atom<T>): [T, DispatchSetStateAction<T>] {
  const [state, setState] = useState<T>(atom.value)

  useEffect(() => subscribe(setState, atom.setStateSubscription), [])

  const publishState: DispatchSetStateAction<T> = newState => {
    atom.setStateSubscription.forEach(setState => {
      setState(newState)
    })

    const newStateValue =
      newState instanceof Function ? newState(atom.value) : newState

    atom.reducerSubscription.forEach(dispatch => {
      dispatch({ type: '__UPDATE__', newState: newStateValue })
    })

    atom.value = newStateValue
  }

  return [state, publishState]
}

interface ReducerAction {
  type: string
  [key: string]: unknown
}

interface ReducerActionWrapper<T> extends ReducerAction {
  newState?: T
}

export function useAtomReducer<T>(
  reducer: React.Reducer<T, ReducerAction>,
  atom: Atom<T>
): [T, DispatchReducerAction<T>]
export function useAtomReducer<T>(
  reducer: React.Reducer<T, ReducerAction>,
  atom: Atom<T | undefined>
): [T | undefined, DispatchReducerAction<T>]

export function useAtomReducer<T>(
  reducer: React.Reducer<T, ReducerAction>,
  atom: Atom<T>
): [T, DispatchReducerAction<T>] {
  const reducerWrapper = (prevState: T, action: ReducerActionWrapper<T>): T =>
    action.type === '__UPDATE__' && action.newState !== undefined
      ? action.newState
      : reducer(prevState, action)

  const [state, dispatch] = useReducer(reducerWrapper, atom.value)

  useEffect(() => subscribe(dispatch, atom.reducerSubscription), [])

  const dispatchAction: DispatchReducerAction<T> = action => {
    atom.reducerSubscription.forEach(dispatch => {
      dispatch(action)
    })

    const newState = reducer(atom.value, action)

    atom.setStateSubscription.forEach(setState => {
      setState(newState)
    })

    atom.value = newState
  }

  return [state, dispatchAction]
}
