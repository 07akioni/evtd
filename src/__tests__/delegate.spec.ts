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
  it('once option should work', () => {
    [window.document, outer].forEach((el) => {
      const cb = jest.fn()
      on('click', el, cb, {
        once: false
      })
      el.dispatchEvent(new Event('click', { bubbles: true }))
      expect(cb).toHaveBeenCalledTimes(1)
      el.dispatchEvent(new Event('click', { bubbles: true }))
      expect(cb).toHaveBeenCalledTimes(2)
      off('click', el, cb)

      const ocb = jest.fn()
      on('click', el, ocb, {
        once: true
      })
      el.dispatchEvent(new Event('click', { bubbles: true }))
      expect(ocb).toHaveBeenCalledTimes(1)
      el.dispatchEvent(new Event('click', { bubbles: true }))
      expect(ocb).toHaveBeenCalledTimes(1)
    })
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
  it('work in right sequence in capture mode (1)', () => {
    const arr: number[] = []
    on(
      'click',
      outer,
      () => {
        arr.push(1)
      },
      true
    )
    on('click', outer, () => {
      arr.push(3)
    })
    outer.addEventListener('click', () => {
      arr.push(2)
    })
    inner.dispatchEvent(
      new Event('click', {
        bubbles: true
      })
    )
    expect(arr).toEqual([1, 2, 3])
  })
  it('work in right sequence in capture mode (2)', () => {
    const arr: number[] = []
    on(
      'click',
      outer,
      () => {
        arr.push(1)
      },
      true
    )
    on('click', outer, () => {
      arr.push(3)
    })
    outer.addEventListener('click', () => {
      arr.push(2)
    })
    outer.dispatchEvent(
      new Event('click', {
        bubbles: true
      })
    )
    expect(arr).toEqual([1, 2, 3])
  })
  it('works with capture on window', () => {
    const fn = jest.fn()
    on('click', window, fn, true)
    document.dispatchEvent(
      new Event('click', {
        bubbles: true
      })
    )
    expect(fn).toHaveBeenCalled()
    off('click', window, fn, true)
  });
  ['click', 'mousemove'].forEach((type) => {
    it(`works with ${type} event`, () => {
      const fn = jest.fn()
      on(type, document, fn)
      outer.dispatchEvent(
        new Event(type, {
          bubbles: true
        })
      )
      expect(fn).toHaveBeenCalled()
      off(type, document, fn)
    })
    it(`has correct ${type} currentTarget`, () => {
      const path = [window, document, document.body, outer, inner]
      path.forEach((_, index) => {
        const subPath = path.slice(index)
        if (subPath.length === 0) return
        const attachTo = subPath[0]
        const currentHandler = (e: Event): void => {
          expect((e as CustomEvent).currentTarget).toEqual(attachTo)
        }
        on(type, attachTo, currentHandler)
        subPath.forEach((target) => {
          target.dispatchEvent(
            new CustomEvent(type, {
              detail: attachTo,
              bubbles: true
            })
          )
        })
        off(type, attachTo, currentHandler)
      })
    })
    it('work call bubble handler when eventPhase is 2', () => {
      const bubbleCb = jest.fn()
      const captureCb = jest.fn()
      on(type, document, bubbleCb)
      on(type, document, captureCb, true)
      document.dispatchEvent(new MouseEvent(type))
      expect(bubbleCb).toHaveBeenCalled()
      expect(captureCb).toHaveBeenCalled()
      inner.dispatchEvent(new MouseEvent(type, { bubbles: false }))
      expect(bubbleCb).toHaveBeenCalledTimes(1)
      expect(captureCb).toHaveBeenCalledTimes(2)
      off(type, document, bubbleCb)
      off(type, document, captureCb, true)
      window.dispatchEvent(new MouseEvent(type))
      expect(bubbleCb).toHaveBeenCalledTimes(1)
      expect(captureCb).toHaveBeenCalledTimes(2)
    })
    it('work with event directily dispatched on window', () => {
      const bubbleCb = jest.fn()
      const captureCb = jest.fn()
      on(type, window, bubbleCb)
      on(type, window, captureCb, true)
      window.dispatchEvent(new MouseEvent(type))
      expect(bubbleCb).toHaveBeenCalled()
      expect(captureCb).toHaveBeenCalled()
      inner.dispatchEvent(new MouseEvent(type, { bubbles: false }))
      expect(bubbleCb).toHaveBeenCalledTimes(1)
      expect(captureCb).toHaveBeenCalledTimes(2)
      off(type, window, bubbleCb)
      off(type, window, captureCb, true)
      window.dispatchEvent(new MouseEvent(type))
      expect(bubbleCb).toHaveBeenCalledTimes(1)
      expect(captureCb).toHaveBeenCalledTimes(2)
    })
    it('work with stop propatation', () => {
      const cb1 = jest.fn()
      const cb2 = jest.fn((e) => {
        e.stopPropagation()
      })
      on(type, window, cb1)
      on(type, document, cb1)
      on(type, outer, cb1)
      on(type, inner, cb2)
      inner.dispatchEvent(new MouseEvent(type, { bubbles: true }))
      expect(cb1).not.toHaveBeenCalled()
      expect(cb2).toHaveBeenCalledTimes(1)
    })
  })
})
