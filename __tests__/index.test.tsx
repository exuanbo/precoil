import React, { FunctionComponent } from 'react'
import { render as rtlRender, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { atom, useAtom } from '../src/index'

const input = atom<string>()
const numberInput = atom(0)
const inputWithDefault = atom('I am a default value')

const Input: FunctionComponent = () => {
  const [value, setValue] = useAtom(input)
  return (
    <input
      aria-label="input"
      value={value ?? ''}
      onChange={e => setValue(e.currentTarget.value)}
    />
  )
}

const MirrorInput: FunctionComponent = () => {
  const [value] = useAtom(input)
  return <span data-testid="mirror-input">{value ?? ''}</span>
}

const UpperCaseInput: FunctionComponent = () => {
  const [value] = useAtom(input)
  return <span data-testid="uppercase-input">{value?.toUpperCase() ?? ''}</span>
}

const ComputedInput: FunctionComponent = () => {
  const [value, setValue] = useAtom(numberInput)
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
          setValue(prevValue => prevValue + getNumber(e.target.value))
        }
      />
      <span data-testid="computed-input">{value}</span>
    </>
  )
}

const InputWithDefault: FunctionComponent = () => {
  const [value, setValue] = useAtom(inputWithDefault)
  return (
    <input
      aria-label="input-with-default"
      value={value}
      onChange={e => setValue(e.currentTarget.value)}
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
  inputWithDefault: HTMLInputElement
}

const setup = (): Setup => {
  rtlRender(<App />)
  const input = screen.getByLabelText('input') as HTMLInputElement
  const mirrorInput = screen.getByTestId('mirror-input')
  const upperCaseInput = screen.getByTestId('uppercase-input')
  const numberInput = screen.getByLabelText('number-input') as HTMLInputElement
  const computedInput = screen.getByTestId('computed-input')
  const inputWithDefault = screen.getByLabelText(
    'input-with-default'
  ) as HTMLInputElement
  return {
    input,
    mirrorInput,
    upperCaseInput,
    numberInput,
    computedInput,
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

it('should work with default value', () => {
  const { inputWithDefault } = setup()
  expect(inputWithDefault.value).toBe('I am a default value')
  fireEvent.change(inputWithDefault, { target: { value: 'Now I am changed' } })
  expect(inputWithDefault.value).toBe('Now I am changed')
})
