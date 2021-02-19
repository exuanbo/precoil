import React, { useState, useEffect, useReducer } from 'react'

type Callback<T> = ((state: T) => void) | (() => void)
type CallbackSubscription<T> = Set<Callback<T>>
type Unsubscribe = () => void
type Subscribe<T> = (cb: Callback<T>) => Unsubscribe

type SetState<T> = React.Dispatch<React.SetStateAction<T>>
type SetStateSubscription<T> = Set<SetState<T>>
type UseAtomState<T> = () => [T, SetState<T>]

type Dispatch<T> = React.Dispatch<React.ReducerAction<React.Reducer<T, any>>>
type DispatchSubscription<T> = Set<Dispatch<T>>

interface ReducerAction {
  type: string
  [key: string]: unknown
}

interface ReducerActionWrapper<T> extends ReducerAction {
  newAtomState?: T
}

type UseAtomReducer<T> = (
  reducer: React.Reducer<T, ReducerAction>
) => [T, Dispatch<T>]

interface Atom<T> {
  subscribe: Subscribe<T>
  useState: UseAtomState<T>
  useReducer: UseAtomReducer<T>
  destroy: () => void
}

const subscribHook = <T>(
  hookAction: SetState<T> | Dispatch<T>,
  hookSubscription: SetStateSubscription<T> | DispatchSubscription<T>
): Unsubscribe => {
  hookSubscription.add(hookAction)
  return () => {
    hookSubscription.delete(hookAction)
  }
}

export function atom<T>(initialState: T): Atom<T>
export function atom<T>(initialState?: T): Atom<T | undefined>

export function atom<T>(initialState: T): Atom<T> {
  let state = initialState

  const callbackSubscription: CallbackSubscription<T> = new Set()

  const subscribe: Subscribe<T> = cb => {
    callbackSubscription.add(cb)
    return () => {
      callbackSubscription.delete(cb)
    }
  }

  const publishCallback = (): void => {
    callbackSubscription.forEach(fn => {
      fn(state)
    })
  }

  const setStateSubscription: SetStateSubscription<T> = new Set()

  const useAtomState: UseAtomState<T> = () => {
    const [currentState, setState] = useState(state)

    useEffect(() => subscribHook(setState, setStateSubscription), [])

    const publishState: SetState<T> = newState => {
      setStateSubscription.forEach(setState => {
        setState(newState)
      })

      const newStateValue =
        newState instanceof Function ? newState(state) : newState

      dispatchSubscription.forEach(dispatch => {
        dispatch({ type: 'UPDATE_ATOM_STATE', newAtomState: newStateValue })
      })

      state = newStateValue

      publishCallback()
    }

    return [currentState, publishState]
  }

  const dispatchSubscription: DispatchSubscription<T> = new Set()

  const useAtomReducer: UseAtomReducer<T> = reducer => {
    const reducerWrapper = (prevState: T, action: ReducerActionWrapper<T>): T =>
      action.type === 'UPDATE_ATOM_STATE' && action.newAtomState !== undefined
        ? action.newAtomState
        : reducer(prevState, action)

    const [currentState, dispatch] = useReducer(reducerWrapper, state)

    useEffect(() => subscribHook(dispatch, dispatchSubscription), [])

    const dispatchAction: Dispatch<T> = action => {
      dispatchSubscription.forEach(dispatch => {
        dispatch(action)
      })

      const newState = reducer(state, action)

      setStateSubscription.forEach(setState => {
        setState(newState)
      })

      state = newState

      publishCallback()
    }

    return [currentState, dispatchAction]
  }

  const destroy = (): void => {
    callbackSubscription.clear()
    setStateSubscription.clear()
    dispatchSubscription.clear()
  }

  return {
    subscribe,
    useState: useAtomState,
    useReducer: useAtomReducer,
    destroy
  }
}
