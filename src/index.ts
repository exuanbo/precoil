import React, { useState, useEffect, useReducer } from 'react'

type Callback<T> = ((state: T) => void) | (() => void)
type DispatchSetStateAction<T> = React.Dispatch<React.SetStateAction<T>>
type DispatchReducerAction<T> = React.Dispatch<
  React.ReducerAction<React.Reducer<T, any>>
>

type CallbackSubscription<T> = Set<Callback<T>>
type DispatchSetStateActionSubscription<T> = Set<DispatchSetStateAction<T>>
type DispatchReducerActionSubscription<T> = Set<DispatchReducerAction<T>>

type Unsubscribe = () => void

interface ReducerAction {
  type: string
  [key: string]: unknown
}

interface ReducerActionWrapper<T> extends ReducerAction {
  newState?: T
}

type UseAtomState<T> = () => [T, DispatchSetStateAction<T>]
type UseAtomReducer<T> = (
  reducer: React.Reducer<T, ReducerAction>
) => [T, DispatchReducerAction<T>]

class Atom<T> {
  #state: T

  #callbackSubscription: CallbackSubscription<T> = new Set()
  #setStateSubscription: DispatchSetStateActionSubscription<T> = new Set()
  #dispatchSubscription: DispatchReducerActionSubscription<T> = new Set()

  constructor(initialState: T) {
    this.#state = initialState
  }

  subscribe = (cb: Callback<T>): Unsubscribe => {
    this.#callbackSubscription.add(cb)
    return () => {
      this.#callbackSubscription.delete(cb)
    }
  }

  #callback = (): void => {
    this.#callbackSubscription.forEach(fn => {
      fn(this.#state)
    })
  }

  #subscribDispatch = <T>(
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

  useState: UseAtomState<T> = () =>
    ((atom): ReturnType<UseAtomState<T>> => {
      const [state, setState] = useState(atom.#state)

      useEffect(
        () => atom.#subscribDispatch(setState, atom.#setStateSubscription),
        []
      )

      const publishState: DispatchSetStateAction<T> = newState => {
        atom.#setStateSubscription.forEach(setState => {
          setState(newState)
        })

        const newStateValue =
          newState instanceof Function ? newState(atom.#state) : newState

        atom.#dispatchSubscription.forEach(dispatch => {
          dispatch({ type: 'ATOM_UPDATE', newState: newStateValue })
        })

        atom.#state = newStateValue

        atom.#callback()
      }

      return [state, publishState]
    })(this)

  useReducer: UseAtomReducer<T> = reducer =>
    ((atom): ReturnType<UseAtomReducer<T>> => {
      const reducerWrapper = (
        prevState: T,
        action: ReducerActionWrapper<T>
      ): T =>
        action.type === 'ATOM_UPDATE' && action.newState !== undefined
          ? action.newState
          : reducer(prevState, action)

      const [state, dispatch] = useReducer(reducerWrapper, atom.#state)

      useEffect(
        () => atom.#subscribDispatch(dispatch, atom.#dispatchSubscription),
        []
      )

      const dispatchAction: DispatchReducerAction<T> = action => {
        atom.#dispatchSubscription.forEach(dispatch => {
          dispatch(action)
        })

        const newState = reducer(atom.#state, action)

        atom.#setStateSubscription.forEach(setState => {
          setState(newState)
        })

        atom.#state = newState

        atom.#callback()
      }

      return [state, dispatchAction]
    })(this)

  distroy = (): void => {
    this.#callbackSubscription.clear()
    this.#setStateSubscription.clear()
    this.#dispatchSubscription.clear()
  }
}

export function atom<T>(initialState: T): Atom<T>
export function atom<T>(initialState?: T): Atom<T | undefined>

export function atom<T>(initialState: T): Atom<T> {
  return new Atom(initialState)
}
