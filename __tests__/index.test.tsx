import React from 'react'
import { render } from 'react-dom'
import { PrecoilRoot } from '../src/index'

it('should work', () => {
  const App = (): JSX.Element => <h1>Precoil</h1>
  render(
    <PrecoilRoot>
      <App />
    </PrecoilRoot>,
    document.createElement('body')
  )
})
