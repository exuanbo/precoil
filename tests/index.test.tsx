import React from 'react'
import { render } from 'react-dom'
import { PrecoilRoot } from '../src/index'

it('should work', () => {
  const div = document.createElement('div')
  const App = (): JSX.Element => <h1>Precoil</h1>
  render(
    <PrecoilRoot>
      <App />
    </PrecoilRoot>,
    div
  )
})
