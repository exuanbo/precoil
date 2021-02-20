import React, { FunctionComponent } from 'react'
import { render as rtlRender, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { atom } from '../src'

const textState = atom<string>()

const countStore = atom({ count: 0 })

const unsubscribe = countStore.subscribe(state => {
  console.log(`State has been changed to ${state.count}.`)
})

const textStateWithDefault = atom('I am a default value')

const Input: FunctionComponent = () => {
  const [text, setText] = textState.useState()
  return (
    <input
      aria-label="input"
      value={text ?? ''}
      onChange={e => setText(e.currentTarget.value)}
    />
  )
}

const MirrorInput: FunctionComponent = () => {
  const [text] = textState.useState()
  return <span data-testid="mirror-input">{text ?? ''}</span>
}

const UpperCaseInput: FunctionComponent = () => {
  const [text] = textState.useState()
  return <span data-testid="uppercase-input">{text?.toUpperCase() ?? ''}</span>
}

const InputWithDefault: FunctionComponent = () => {
  const [text, setText] = textStateWithDefault.useState()
  return (
    <input
      aria-label="input-with-default"
      value={text}
      onChange={e => setText(e.currentTarget.value)}
    />
  )
}

const Counter: FunctionComponent = () => {
  const [state, setState] = countStore.useState()
  const [, dispatch] = countStore.useReducer((state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { count: state.count + 1 }
      default:
        return state
    }
  })
  const getNumber = (value: number | string): number => {
    const parsedNumber = Number(value)
    if (isNaN(parsedNumber)) {
      return 0
    }
    return parsedNumber
  }
  return (
    <>
      <input
        aria-label="number-input"
        onChange={e =>
          setState(({ count }) => ({
            count: count + getNumber(e.target.value)
          }))
        }
      />
      <span data-testid="counter">{state.count}</span>
      <button data-testid="inc" onClick={() => dispatch({ type: 'INCREMENT' })}>
        inc
      </button>
      <button data-testid="reset" onClick={() => setState({ count: 0 })}>
        reset
      </button>
    </>
  )
}

const App: FunctionComponent = () => (
  <>
    <Input />
    <MirrorInput />
    <UpperCaseInput />
    <InputWithDefault />
    <Counter />
  </>
)

interface Setup {
  input: HTMLInputElement
  mirrorInput: HTMLElement
  upperCaseInput: HTMLElement
  inputWithDefault: HTMLInputElement
  counter: HTMLElement
  numberInput: HTMLInputElement
  incBtn: HTMLElement
  resetBtn: HTMLElement
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
  const incBtn = screen.getByTestId('inc')
  const resetBtn = screen.getByTestId('reset')
  return {
    input,
    mirrorInput,
    upperCaseInput,
    inputWithDefault,
    counter,
    numberInput,
    incBtn,
    resetBtn
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
  const { numberInput, counter } = setup()
  expect(counter).toHaveTextContent('0')

  fireEvent.change(numberInput, { target: { value: '1' } })
  expect(counter).toHaveTextContent('1')

  fireEvent.change(numberInput, { target: { value: '2' } })
  expect(counter).toHaveTextContent('3')
})

it('should work with `atom.useReducer`', () => {
  const { numberInput, counter, incBtn, resetBtn } = setup()
  expect(counter).toHaveTextContent('3')

  fireEvent.change(numberInput, { target: { value: '1' } })
  expect(counter).toHaveTextContent('4')

  fireEvent.click(incBtn)
  expect(counter).toHaveTextContent('5')

  fireEvent.change(numberInput, { target: { value: '2' } })
  expect(counter).toHaveTextContent('7')

  fireEvent.click(incBtn)
  expect(counter).toHaveTextContent('8')

  unsubscribe()

  fireEvent.click(resetBtn)
  expect(counter).toHaveTextContent('0')

  countStore.destroy()

  fireEvent.click(incBtn)
  expect(counter).toHaveTextContent('0')
})
