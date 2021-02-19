import React, { useState, useEffect, useReducer } from 'react'

type Callback<T> = ((state: T) => void) | (() => void)
type CallbackSubscription<T> = Set<Callback<T>>
type Unsubscribe = () => void
type Subscribe<T> = (cb: Callback<T>) => Unsubscribe

type DispatchSetStateAction<T> = React.Dispatch<React.SetStateAction<T>>
type DispatchSetStateActionSubscription<T> = Set<DispatchSetStateAction<T>>
type UseAtomState<T> = () => [T, DispatchSetStateAction<T>]

type DispatchReducerAction<T> = React.Dispatch<
  React.ReducerAction<React.Reducer<T, any>>
>
type DispatchReducerActionSubscription<T> = Set<DispatchReducerAction<T>>

interface ReducerAction {
  type: string
  [key: string]: unknown
}

interface ReducerActionWrapper<T> extends ReducerAction {
  newAtomState?: T
}

type UseAtomReducer<T> = (
  reducer: React.Reducer<T, ReducerAction>
) => [T, DispatchReducerAction<T>]

interface Atom<T> {
  subscribe: Subscribe<T>
  useState: UseAtomState<T>
  useReducer: UseAtomReducer<T>
  destroy: () => void
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

  const subscribDispatch = <T>(
    dispatch: DispatchSetStateAction<T> | DispatchReducerAction<T>,
    subscription:
      | DispatchSetStateActionSubscription<T>
      | DispatchReducerActionSubscription<T>
  ): Unsubscribe => {
    subscription.add(dispatch)
    return () => {
      subscription.delete(dispatch)
    }
  }

  const setStateSubscription: DispatchSetStateActionSubscription<T> = new Set()

  const useAtomState: UseAtomState<T> = () => {
    const [_state, setState] = useState(state)

    useEffect(() => subscribDispatch(setState, setStateSubscription), [])

    const publishState: DispatchSetStateAction<T> = newState => {
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

    return [_state, publishState]
  }

  const dispatchSubscription: DispatchReducerActionSubscription<T> = new Set()

  const useAtomReducer: UseAtomReducer<T> = reducer => {
    const reducerWrapper = (prevState: T, action: ReducerActionWrapper<T>): T =>
      action.type === 'UPDATE_ATOM_STATE' && action.newAtomState !== undefined
        ? action.newAtomState
        : reducer(prevState, action)

    const [_state, dispatch] = useReducer(reducerWrapper, state)

    useEffect(() => subscribDispatch(dispatch, dispatchSubscription), [])

    const dispatchAction: DispatchReducerAction<T> = action => {
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

    return [_state, dispatchAction]
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
