import { Handler } from './interface'
import { trapOn, trapOff } from './traps'

interface Handlers {
  bubble: Set<Handler>
  capture: Set<Handler>
}
type ElToHandlers = Map<EventTarget, Handlers>

type Phase = 'capture' | 'bubble'

interface Delegate {
  on:
  ((type: string, el: EventTarget, handler: Handler, useCapture?: boolean) => void) &
  ((type: string, el: EventTarget, handler: Handler, options?: EventListenerOptions) => void)
  off:
  ((type: string, el: EventTarget, handler: Handler, useCapture?: boolean) => void) &
  ((type: string, el: EventTarget, handler: Handler, useCapture?: EventListenerOptions) => void)
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
  // Note
  // If you register a capture event handler on window
  // and the e.target is window too, only the bubble event handlers will be resolved.
  // The e.eventPhase will be 2 at that time. In browser, useCapture will be ignored
  // and the sequence being called is its registered sequence. In evtd, it will cause an
  // error...
  function createUnifiedHandler (): Handler {
    const delegeteHandler = function (e: Event): void {
      const { type, eventPhase, target } = e
      const phase = eventPhase === 1 ? 'capture' : 'bubble'
      let cursor = target
      const path = []
      // collecting bubble path
      while (true) {
        if (cursor === null) cursor = window
        path.push(cursor)
        if (cursor === window) {
          break
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        cursor = ((cursor as any).parentNode || null) as (EventTarget | null)
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
    handler: Handler,
    options?: boolean | EventListenerOptions
  ): void {
    const trapped = trapOn(type as any, el as Element, handler, options)
    if (trapped) return

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
    handler: Handler,
    options?: boolean | EventListenerOptions
  ): void {
    const trapped = trapOff(type as any, el as Element, handler, options)
    if (trapped) return
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
