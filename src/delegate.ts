interface Handlers {
  bubble: Set<(e: Event) => any>
  capture: Set<(e: Event) => any>
}
type ElToHandlers = Map<EventTarget, Handlers>

type Phase = 'capture' | 'bubble'

interface Delegate {
  on:
  ((type: string, el: EventTarget, handler: (e: Event) => any, useCapture?: boolean) => void) &
  ((type: string, el: EventTarget, handler: (e: Event) => any, options?: EventListenerOptions) => void)
  off:
  ((type: string, el: EventTarget, handler: (e: Event) => any, useCapture?: boolean) => void) &
  ((type: string, el: EventTarget, handler: (e: Event) => any, useCapture?: EventListenerOptions) => void)
}

// currently `once` and `passive` is not supported
function createDelegate (): Delegate {
  const typeToElToHandlers: {
    bubble: {
      [key: string]: ElToHandlers | undefined
    }
    capture: {
      [key: string]: ElToHandlers | undefined
    }
  } = {
    bubble: {},
    capture: {}
  }
  function createUnifiedHandler (): (e: Event) => any {
    const delegeteHandler = function (e: Event): void {
      const { type } = e
      const phase = e.eventPhase === 1 ? 'capture' : 'bubble'
      let cursor = e.target
      const path = []
      // collecting bubble path
      while (true) {
        if (cursor === null) cursor = window
        path.push(cursor)
        if (cursor === window) {
          break
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        cursor = ((cursor as any).parentElement || null) as (EventTarget | null)
      }
      const elToHandlers = typeToElToHandlers[phase][type]
      if (elToHandlers === undefined) {
        console.error('[evtd]: attached listener has no corresponding handler, this could be a bug of evtd.')
        return
      }
      if (phase === 'capture') {
        // capture
        for (let i = path.length - 1; i >= 0; --i) {
          const handlers = elToHandlers.get(path[i])
          if (handlers !== undefined) {
            handlers.capture.forEach(handler => handler(e))
          }
        }
      } else {
        // bubble
        for (let i = 0; i < path.length; ++i) {
          const handlers = elToHandlers.get(path[i])
          if (handlers !== undefined) {
            handlers.bubble.forEach(handler => handler(e))
          }
        }
      }
    }
    delegeteHandler.displayName = 'evtdUnifiedHandler'
    return delegeteHandler
  }
  const unifiedHandler = createUnifiedHandler()
  function ensureElToHandlers (type: string, phase: Phase): ElToHandlers {
    const phaseHandlers = typeToElToHandlers[phase]
    if (phaseHandlers[type] === undefined) {
      phaseHandlers[type] = new Map()
      window.addEventListener(type, unifiedHandler, phase === 'capture')
    }
    return phaseHandlers[type] as ElToHandlers
  }
  function ensureHandlers (
    elToHandlers: ElToHandlers,
    el: EventTarget
  ): Handlers {
    let elHandlers = elToHandlers.get(el)
    if (elHandlers === undefined) {
      elToHandlers.set(el, (elHandlers = {
        bubble: new Set(),
        capture: new Set()
      }))
    }
    return elHandlers
  }
  function on (
    type: string,
    el: EventTarget,
    handler: (e: Event) => any,
    options?: boolean | EventListenerOptions
  ): void {
    const phase = (
      options === true || (typeof options === 'object' && options.capture === true)
    ) ? 'capture' : 'bubble'
    const elToHandlers = ensureElToHandlers(type, phase)
    const handlers = ensureHandlers(elToHandlers, el)
    const phaseHandlers = handlers[phase]
    if (!phaseHandlers.has(handler)) phaseHandlers.add(handler)
  }
  function off (
    type: string,
    el: EventTarget,
    handler: (e: Event) => any,
    options?: boolean | EventListenerOptions
  ): void {
    const phase = (
      options === true || (typeof options === 'object' && options.capture === true)
    ) ? 'capture' : 'bubble'
    const elToHandlers = ensureElToHandlers(type, phase)
    const handlers = ensureHandlers(elToHandlers, el)
    const phaseHandlers = handlers[phase]
    if (phaseHandlers.has(handler)) phaseHandlers.delete(handler)
    if (phaseHandlers.size === 0) {
      elToHandlers.delete(el)
    }
    if (elToHandlers.size === 0) {
      window.removeEventListener(type, unifiedHandler, phase === 'capture')
      typeToElToHandlers[phase][type] = undefined
    }
  }
  return {
    on,
    off
  }
}

const {
  on,
  off
} = createDelegate()

export { on, off }
