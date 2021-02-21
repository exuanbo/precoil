import React, { useEffect, useState } from 'react'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>
type SetStateSubscription<T> = Set<SetState<T>>
type UseAtomState<T> = () => [T, SetState<T>]

type Dispatch<T> = React.Dispatch<React.ReducerAction<React.Reducer<T, any>>>
type UseAtomReducer<T> = (reducer: React.Reducer<T, any>) => [T, Dispatch<T>]

type Callback<T> = ((state: T) => void) | (() => void)
type CallbackSubscription<T> = Set<Callback<T>>
type Unsubscribe = () => void
type SubscribeCallback<T> = (cb: Callback<T>) => Unsubscribe

function subscrib<T>(
  setStateSubscription: SetStateSubscription<T>,
  setState: SetState<T>
): Unsubscribe

function subscrib<T>(
  callbackSubscription: CallbackSubscription<T>,
  cb: Callback<T>
): Unsubscribe

function subscrib<T>(
  setStateSubscription: SetStateSubscription<T>,
  setState: SetState<T>
): Unsubscribe {
  setStateSubscription.add(setState)
  return () => {
    setStateSubscription.delete(setState)
  }
}

interface Atom<T> {
  useState: UseAtomState<T>
  useReducer: UseAtomReducer<T>
  subscribe: SubscribeCallback<T>
  destroy: () => void
}

export function atom<T>(initialState: T): Atom<T>
export function atom<T>(initialState?: T): Atom<T | undefined>

export function atom<T>(initialState: T): Atom<T> {
  let state = initialState

  const setStateSubscription: SetStateSubscription<T> = new Set()

  const useAtomState: UseAtomState<T> = () => {
    const [currentState, setState] = useState(state)

    useEffect(() => subscrib(setStateSubscription, setState), [])

    const publishState: SetState<T> = newState => {
      const newStateValue =
        newState instanceof Function ? newState(state) : newState

      setStateSubscription.forEach(setState => {
        setState(newState)
      })

      state = newStateValue
      publishCallback()
    }

    return [currentState, publishState]
  }

  const useAtomReducer: UseAtomReducer<T> = reducer => {
    const [currentState, publishState] = useAtomState()

    const dispatch: Dispatch<T> = action => {
      const newState = reducer(state, action)
      publishState(newState)
    }

    return [currentState, dispatch]
  }

  const callbackSubscription: CallbackSubscription<T> = new Set()

  const subscribeCallback: SubscribeCallback<T> = cb =>
    subscrib(callbackSubscription, cb)

  const publishCallback = (): void => {
    callbackSubscription.forEach(fn => {
      fn(state)
    })
  }

  const destroy = (): void => {
    setStateSubscription.clear()
    callbackSubscription.clear()
  }

  return {
    useState: useAtomState,
    useReducer: useAtomReducer,
    subscribe: subscribeCallback,
    destroy
  }
}
