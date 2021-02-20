import React from 'react'
import { render as rtlRender, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { atom } from '../src'

const textState = atom<string>()

const textStateWithDefault = atom('I am a default value')

const countStore = atom({ count: 0 })

const Input: React.FC = () => {
  const [text, setText] = textState.useState()
  return (
    <input
      aria-label="input"
      value={text ?? ''}
      onChange={e => setText(e.currentTarget.value)}
    />
  )
}

const MirrorInput: React.FC = () => {
  const [text] = textState.useState()
  return <span data-testid="mirror-input">{text ?? ''}</span>
}

const UpperCaseInput: React.FC = () => {
  const [text] = textState.useState()
  return <span data-testid="uppercase-input">{text?.toUpperCase() ?? ''}</span>
}

const InputWithDefault: React.FC = () => {
  const [text, setText] = textStateWithDefault.useState()
  return (
    <input
      aria-label="input-with-default"
      value={text}
      onChange={e => setText(e.currentTarget.value)}
    />
  )
}

const Counter: React.FC = () => {
  const [state, setState] = countStore.useState()

  return (
    <>
      <input
        aria-label="number-input"
        onChange={e =>
          setState(state => ({
            count: state.count + Number(e.target.value)
          }))
        }
      />
      <span data-testid="counter">{state.count}</span>
      <button data-testid="reset-btn" onClick={() => setState({ count: 0 })}>
        reset
      </button>
    </>
  )
}

const MirrorCounter: React.FC = () => {
  const [state] = countStore.useReducer(prevState => prevState)
  return <span data-testid="mirror-counter">{state.count}</span>
}

const App: React.FC = () => (
  <>
    <Input />
    <MirrorInput />
    <UpperCaseInput />
    <InputWithDefault />
    <Counter />
    <MirrorCounter />
  </>
)

interface Setup {
  input: HTMLInputElement
  mirrorInput: HTMLElement
  upperCaseInput: HTMLElement
  inputWithDefault: HTMLInputElement

  counter: HTMLElement
  numberInput: HTMLInputElement
  resetBtn: HTMLElement

  mirrorCounter: HTMLElement
}

const setup = (): Setup => {
  rtlRender(<App />)
  const input = screen.getByLabelText('input') as HTMLInputElement
  const mirrorInput = screen.getByTestId('mirror-input')
  const upperCaseInput = screen.getByTestId('uppercase-input')
  const inputWithDefault = screen.getByLabelText(
    'input-with-default'
  ) as HTMLInputElement

  const counter = screen.getByTestId('counter')
  const numberInput = screen.getByLabelText('number-input') as HTMLInputElement
  const resetBtn = screen.getByTestId('reset-btn')

  const mirrorCounter = screen.getByTestId('mirror-counter')

  return {
    input,
    mirrorInput,
    upperCaseInput,
    inputWithDefault,
    counter,
    numberInput,
    resetBtn,
    mirrorCounter
  }
}

it('should work', () => {
  const { input, mirrorInput, upperCaseInput } = setup()
  expect(input.value).toBe('')

  fireEvent.change(input, { target: { value: 'hi' } })
  expect(input.value).toBe('hi')

  expect(mirrorInput).toHaveTextContent('hi')
  expect(upperCaseInput).toHaveTextContent('HI')
})

it('should work with default value', () => {
  const { inputWithDefault } = setup()
  expect(inputWithDefault.value).toBe('I am a default value')

  fireEvent.change(inputWithDefault, { target: { value: 'Now I am changed' } })
  expect(inputWithDefault.value).toBe('Now I am changed')
})

it('should work when setState accepts a function', () => {
  const { counter, numberInput, resetBtn, mirrorCounter } = setup()
  expect(counter).toHaveTextContent('0')
  expect(mirrorCounter).toHaveTextContent('0')

  fireEvent.change(numberInput, { target: { value: '1' } })
  expect(counter).toHaveTextContent('1')
  expect(mirrorCounter).toHaveTextContent('1')

  fireEvent.change(numberInput, { target: { value: '2' } })
  expect(counter).toHaveTextContent('3')
  expect(mirrorCounter).toHaveTextContent('3')

  fireEvent.click(resetBtn)
  expect(counter).toHaveTextContent('0')
  expect(mirrorCounter).toHaveTextContent('0')
})
