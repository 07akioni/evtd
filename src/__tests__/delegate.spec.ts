import { on, off } from '../index'

describe('# delegate', () => {
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
  it('dispatch on window', () => {
    const cb = jest.fn()
    on('click', window, cb)
    window.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(1)
    off('click', window, cb)
    window.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(1)
  })
  it('dispatch on outer div', () => {
    const cb = jest.fn()
    on('click', window, cb)
    const inner = document.getElementById('outer') as HTMLDivElement
    inner.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(1)
    off('click', window, cb)
    inner.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(1)
  })
  it('dispatch on inner div', () => {
    const cb = jest.fn()
    on('click', outer, cb)
    inner.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(1)
    off('click', outer, cb)
    inner.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(1)
  })
  it('do not add duplicate handler', () => {
    const cb = jest.fn()
    on('click', window, cb)
    on('click', window, cb)
    window.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(1)
    off('click', window, cb)
    window.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(1)
  })
  it('remove unregistered handler', () => {
    const cb = jest.fn()
    on('click', window, cb)
    on('click', window, cb)
    window.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(1)
    off('click', window, () => {})
    window.dispatchEvent(new Event('click', { bubbles: true }))
    expect(cb).toHaveBeenCalledTimes(2)
    off('click', window, cb)
  })
  it('work in capture mode', () => {
    const arr: number[] = []
    on('click', outer, () => {
      arr.push(1)
    }, true)
    on('click', outer, () => {
      arr.push(3)
    })
    outer.addEventListener('click', () => {
      arr.push(2)
    })
    inner.dispatchEvent(new Event('click', {
      bubbles: true
    }))
    expect(arr).toEqual([1, 2, 3])
  })
})
