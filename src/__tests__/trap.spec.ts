import { on, off } from '../index'

describe('trap', () => {
  let outer: HTMLDivElement
  let inner: HTMLDivElement
  beforeEach(() => {
    document.body.innerHTML = '<div id="outer"><div id="inner"></div></div>'
    outer = document.getElementById('outer') as HTMLDivElement
    inner = document.getElementById('inner') as HTMLDivElement
  })
  afterEach(() => {
    document.body.innerHTML = ''
    outer = null as any
    inner = null as any
  })
  describe('mousemoveoutside', () => {
    it('works', () => {
      const fn = jest.fn()
      on('mousemoveoutside', inner, fn)
      outer.dispatchEvent(new Event('mousemove', { bubbles: true }))
      expect(fn).toHaveBeenCalledTimes(1)
      inner.dispatchEvent(new Event('mousemove', { bubbles: true }))
      expect(fn).toHaveBeenCalledTimes(1)
      off('mousemoveoutside', inner, fn)
      outer.dispatchEvent(new Event('mousemove', { bubbles: true }))
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
