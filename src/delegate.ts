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
  (<K extends keyof HTMLElementEventMap>(type: K, el: HTMLElement, handler: (e: HTMLElementEventMap[K]) => any, useCapture?: boolean) => void) &
  (<K extends keyof HTMLElementEventMap>(type: K, el: HTMLElement, handler: (e: HTMLElementEventMap[K]) => any, options?: EventListenerOptions) => void) &
  (<K extends keyof WindowEventMap>(type: K, el: Window, handler: (e: WindowEventMap[K]) => any, useCapture?: boolean) => void) &
  (<K extends keyof WindowEventMap>(type: K, el: Window, handler: (e: WindowEventMap[K]) => any, options?: EventListenerOptions) => void) &
  (<K extends keyof DocumentEventMap>(type: K, el: Document, handler: (e: DocumentEventMap[K]) => any, useCapture?: boolean) => void) &
  (<K extends keyof DocumentEventMap>(type: K, el: Document, handler: (e: DocumentEventMap[K]) => any, options?: EventListenerOptions) => void) &
  ((type: String, el: EventTarget, handler: EventListener, useCapture?: boolean) => void) &
  ((type: String, el: EventTarget, handler: EventListener, options?: EventListenerOptions) => void)
  off:
  (<K extends keyof HTMLElementEventMap>(type: K, el: HTMLElement, handler: (e: HTMLElementEventMap[K]) => any, useCapture?: boolean) => void) &
  (<K extends keyof HTMLElementEventMap>(type: K, el: HTMLElement, handler: (e: HTMLElementEventMap[K]) => any, options?: EventListenerOptions) => void) &
  (<K extends keyof WindowEventMap>(type: K, el: Window, handler: (e: WindowEventMap[K]) => any, useCapture?: boolean) => void) &
  (<K extends keyof WindowEventMap>(type: K, el: Window, handler: (e: WindowEventMap[K]) => any, options?: EventListenerOptions) => void) &
  (<K extends keyof DocumentEventMap>(type: K, el: Document, handler: (e: DocumentEventMap[K]) => any, useCapture?: boolean) => void) &
  (<K extends keyof DocumentEventMap>(type: K, el: Document, handler: (e: DocumentEventMap[K]) => any, options?: EventListenerOptions) => void) &
  ((type: string, el: EventTarget, handler: EventListener, useCapture?: boolean) => void) &
  ((type: string, el: EventTarget, handler: EventListener, options?: EventListenerOptions) => void)
}

const currentTargets = new WeakMap<Event, EventTarget>()
const currentTargetDescriptor = Object.getOwnPropertyDescriptor(Event.prototype, 'currentTarget')
function getCurrentTarget (this: Event): EventTarget | null {
  return currentTargets.get(this) ?? null
}

function defineCurrentTarget (event: Event, getter?: () => EventTarget | null): void {
  if (currentTargetDescriptor === undefined) return
  Object.defineProperty(event, 'currentTarget', {
    configurable: true,
    enumerable: true,
    get: getter ?? currentTargetDescriptor.get
  })
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
      defineCurrentTarget(e, getCurrentTarget)
      if (phase === 'capture') {
        // capture
        for (let i = path.length - 1; i >= 0; --i) {
          const target = path[i]
          const handlers = elToHandlers.get(target)
          if (handlers !== undefined) {
            currentTargets.set(e, target)
            handlers.capture.forEach(handler => handler(e))
          }
        }
      } else {
        // bubble
        for (let i = 0; i < path.length; ++i) {
          const target = path[i]
          const handlers = elToHandlers.get(target)
          if (handlers !== undefined) {
            currentTargets.set(e, target)
            handlers.bubble.forEach(handler => handler(e))
          }
        }
      }
      defineCurrentTarget(e)
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
    on: on as any,
    off: off as any
  }
}

const {
  on,
  off
} = createDelegate()

export { on, off }
