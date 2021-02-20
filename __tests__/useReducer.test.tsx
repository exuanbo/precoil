import React from 'react'
import { render as rtlRender, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { atom } from '../src'

const countStore = atom({ count: 0 })

const unsubscribe = countStore.subscribe(state => {
  console.log(`State has been changed to ${state.count}.`)
})

const Counter: React.FC = () => {
  const [state, dispatch] = countStore.useReducer(
    (state, action: { type: string; payload?: number }) => {
      switch (action.type) {
        case 'ADD':
          return { count: state.count + (action.payload ?? 0) }
        case 'INCREMENT':
          return { count: state.count + 1 }
        case 'RESET':
          return { count: 0 }
        default:
          return state
      }
    }
  )

  return (
    <>
      <input
        aria-label="number-input"
        onChange={e =>
          dispatch({ type: 'ADD', payload: Number(e.target.value) })
        }
      />
      <span data-testid="counter">{state.count}</span>
      <button
        data-testid="inc-btn"
        onClick={() => dispatch({ type: 'INCREMENT' })}>
        inc
      </button>
      <button
        data-testid="reset-btn"
        onClick={() => dispatch({ type: 'RESET' })}>
        reset
      </button>
    </>
  )
}

const MirrorCounter: React.FC = () => {
  const [state] = countStore.useState()
  return <span data-testid="mirror-counter">{state.count}</span>
}

const App: React.FC = () => (
  <>
    <Counter />
    <MirrorCounter />
  </>
)

interface Setup {
  counter: HTMLElement
  numberInput: HTMLInputElement
  incBtn: HTMLElement
  resetBtn: HTMLElement

  mirrorCounter: HTMLElement
}

const setup = (): Setup => {
  rtlRender(<App />)

  const counter = screen.getByTestId('counter')
  const numberInput = screen.getByLabelText('number-input') as HTMLInputElement
  const incBtn = screen.getByTestId('inc-btn')
  const resetBtn = screen.getByTestId('reset-btn')

  const mirrorCounter = screen.getByTestId('mirror-counter')

  return {
    counter,
    numberInput,
    incBtn,
    resetBtn,
    mirrorCounter
  }
}

it('should work', () => {
  const { numberInput, counter, incBtn, resetBtn, mirrorCounter } = setup()
  expect(counter).toHaveTextContent('0')
  expect(mirrorCounter).toHaveTextContent('0')

  fireEvent.change(numberInput, { target: { value: '1' } })
  expect(counter).toHaveTextContent('1')
  expect(mirrorCounter).toHaveTextContent('1')

  fireEvent.click(incBtn)
  expect(counter).toHaveTextContent('2')
  expect(mirrorCounter).toHaveTextContent('2')

  fireEvent.change(numberInput, { target: { value: '2' } })
  expect(counter).toHaveTextContent('4')
  expect(mirrorCounter).toHaveTextContent('4')

  fireEvent.click(incBtn)
  expect(counter).toHaveTextContent('5')
  expect(mirrorCounter).toHaveTextContent('5')

  unsubscribe()

  fireEvent.click(resetBtn)
  expect(counter).toHaveTextContent('0')
  expect(mirrorCounter).toHaveTextContent('0')

  countStore.destroy()

  fireEvent.click(incBtn)
  expect(counter).toHaveTextContent('0')
  expect(mirrorCounter).toHaveTextContent('0')
})
