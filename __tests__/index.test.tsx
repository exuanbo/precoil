import React, { FunctionComponent } from 'react'
import { render as rtlRender, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PrecoilRoot, atom, usePrecoilState } from '../src/index'

const input = atom<string>()
const inputWithDefault = atom('I am a default value')

const Input: FunctionComponent = () => {
  const [value, setValue] = usePrecoilState(input)
  return (
    <input
      aria-label="input"
      value={value ?? ''}
      onChange={e => setValue(e.currentTarget.value)}
    />
  )
}

const MirrorInput: FunctionComponent = () => {
  const [value] = usePrecoilState(input)
  return <span data-testid="mirror-input">{value ?? ''}</span>
}

const UpperCaseInput: FunctionComponent = () => {
  const [value] = usePrecoilState(input)
  return <span data-testid="uppercase-input">{value?.toUpperCase() ?? ''}</span>
}

const InputWithDefault: FunctionComponent = () => {
  const [value, setValue] = usePrecoilState(inputWithDefault)
  return (
    <input
      aria-label="input-with-default"
      value={value}
      onChange={e => setValue(e.currentTarget.value)}
    />
  )
}

const App: FunctionComponent = () => (
  <PrecoilRoot>
    <Input />
    <MirrorInput />
    <UpperCaseInput />
    <InputWithDefault />
  </PrecoilRoot>
)

interface Setup {
  input: HTMLInputElement
  mirrorInput: HTMLElement
  upperCaseInput: HTMLElement
  inputWithDefault: HTMLInputElement
}

const setup = (): Setup => {
  rtlRender(<App />)
  const input = screen.getByLabelText('input') as HTMLInputElement
  const mirrorInput = screen.getByTestId('mirror-input')
  const upperCaseInput = screen.getByTestId('uppercase-input')
  const inputWithDefault = screen.getByLabelText(
    'input-with-default'
  ) as HTMLInputElement
  return {
    input,
    mirrorInput,
    upperCaseInput,
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

it('should work with default value', () => {
  const { inputWithDefault } = setup()
  expect(inputWithDefault.value).toBe('I am a default value')
  fireEvent.change(inputWithDefault, { target: { value: 'Now I am changed' } })
  expect(inputWithDefault.value).toBe('Now I am changed')
})
