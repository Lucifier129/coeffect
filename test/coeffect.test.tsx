import 'jest'
import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { createEffect } from '../src/coeffect'

type TestEffect = {
  options: {}
  consumer: {}
  handler: {
    getValue: () => number
  }
}
let Test = createEffect<TestEffect>((consumer, options) => {
  return {
    getValue() {
      return 0
    }
  }
})

describe('coeffect', () => {
  let container: HTMLDivElement | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container!)
  })

  afterEach(() => {
    document.body.removeChild(container!)
    container = undefined
  })

  it('support create effect', () => {
    expect(typeof Test.useEffects).toBe('function')
    expect(typeof Test.create).toBe('function')
  })

  it('should throw error if calling handler in render-phase', () => {
    let App = () => {
      let effect = Test.useEffects({}, {})
      let n = effect.getValue()

      return <>{n}</>
    }

    expect(() => {
      act(() => {
        ReactDOM.render(<App />, container!)
      })
    }).toThrow()
  })
})
