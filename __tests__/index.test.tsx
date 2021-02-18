import React, { FunctionComponent } from 'react'
import { render as rtlRender, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { atom, useAtom, useAtomReducer } from '../src/index'

const textState = atom<string>()
const numberStore = atom({ number: 0 })
const textStateWithDefault = atom('I am a default value')

const Input: FunctionComponent = () => {
  const [text, setText] = useAtom(textState)
  return (
    <input
      aria-label="input"
      value={text ?? ''}
      onChange={e => setText(e.currentTarget.value)}
    />
  )
}

const MirrorInput: FunctionComponent = () => {
  const [text] = useAtom(textState)
  return <span data-testid="mirror-input">{text ?? ''}</span>
}

const UpperCaseInput: FunctionComponent = () => {
  const [text] = useAtom(textState)
  return <span data-testid="uppercase-input">{text?.toUpperCase() ?? ''}</span>
}

const ComputedInput: FunctionComponent = () => {
  const [{ number }, setNumberStore] = useAtom(numberStore)
  const dispatch = useAtomReducer((state, action) => {
    switch (action.type) {
      case 'increment':
        return { number: state.number + 1 }
      default:
        return state
    }
  }, numberStore)[1]
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
          setNumberStore(({ number }) => ({
            number: number + getNumber(e.target.value)
          }))
        }
      />
      <span data-testid="computed-input">{number}</span>
      <button data-testid="inc" onClick={() => dispatch({ type: 'increment' })}>
        inc
      </button>
      <button data-testid="reset" onClick={() => setNumberStore({ number: 0 })}>
        reset
      </button>
    </>
  )
}

const InputWithDefault: FunctionComponent = () => {
  const [text, setText] = useAtom(textStateWithDefault)
  return (
    <input
      aria-label="input-with-default"
      value={text}
      onChange={e => setText(e.currentTarget.value)}
    />
  )
}

const App: FunctionComponent = () => (
  <>
    <Input />
    <MirrorInput />
    <UpperCaseInput />
    <ComputedInput />
    <InputWithDefault />
  </>
)

interface Setup {
  input: HTMLInputElement
  mirrorInput: HTMLElement
  upperCaseInput: HTMLElement
  numberInput: HTMLInputElement
  computedInput: HTMLElement
  incBtn: HTMLElement
  resetBtn: HTMLElement
  inputWithDefault: HTMLInputElement
}

const setup = (): Setup => {
  rtlRender(<App />)
  const input = screen.getByLabelText('input') as HTMLInputElement
  const mirrorInput = screen.getByTestId('mirror-input')
  const upperCaseInput = screen.getByTestId('uppercase-input')
  const numberInput = screen.getByLabelText('number-input') as HTMLInputElement
  const computedInput = screen.getByTestId('computed-input')
  const incBtn = screen.getByTestId('inc')
  const resetBtn = screen.getByTestId('reset')
  const inputWithDefault = screen.getByLabelText(
    'input-with-default'
  ) as HTMLInputElement
  return {
    input,
    mirrorInput,
    upperCaseInput,
    numberInput,
    computedInput,
    incBtn,
    resetBtn,
    inputWithDefault
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

it('should work when setState accepts a function', () => {
  const { numberInput, computedInput } = setup()
  expect(computedInput).toHaveTextContent('0')
  fireEvent.change(numberInput, { target: { value: '1' } })
  expect(computedInput).toHaveTextContent('1')
  fireEvent.change(numberInput, { target: { value: '2' } })
  expect(computedInput).toHaveTextContent('3')
})

it('should work when setState accepts a function', () => {
  const { numberInput, computedInput, incBtn, resetBtn } = setup()
  expect(computedInput).toHaveTextContent('3')
  fireEvent.change(numberInput, { target: { value: '1' } })
  expect(computedInput).toHaveTextContent('4')
  fireEvent.click(incBtn)
  expect(computedInput).toHaveTextContent('5')
  fireEvent.change(numberInput, { target: { value: '2' } })
  expect(computedInput).toHaveTextContent('7')
  fireEvent.click(incBtn)
  expect(computedInput).toHaveTextContent('8')
  fireEvent.click(resetBtn)
  expect(computedInput).toHaveTextContent('0')
})

it('should work with default value', () => {
  const { inputWithDefault } = setup()
  expect(inputWithDefault.value).toBe('I am a default value')
  fireEvent.change(inputWithDefault, { target: { value: 'Now I am changed' } })
  expect(inputWithDefault.value).toBe('Now I am changed')
})
