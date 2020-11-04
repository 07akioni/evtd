import {
  on,
  off
} from './delegate'
import {
  Handler
} from './interface'

type TrapEventNames = 'mousemoveoutside' | 'clickoutside'

const traps = {
  mousemoveoutside: new WeakMap<EventTarget, WeakMap<Function, TrapHandlers>>(),
  clickoutside: new WeakMap<EventTarget, WeakMap<Function, TrapHandlers>>()
}

interface TrapHandlers {
  [key: string]: Handler
}

function createTrapHandler (
  name: TrapEventNames,
  el: Element,
  originalHandler: Handler
): TrapHandlers {
  if (name === 'mousemoveoutside') {
    return {
      mousemove: (e: Event) => {
        if (el.contains(e.target as any)) return
        originalHandler(e)
      }
    }
  } else if (name === 'clickoutside') {
    let mouseDownOutside = false
    return {
      mousedown: (e: Event) => {
        mouseDownOutside = !el.contains(e.target as any)
      },
      mouseup: (e: Event) => {
        if (!mouseDownOutside) return
        if (el.contains(e.target as any)) return
        originalHandler(e)
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.error(`[evtd/create-trap-handler]: name \`${name}\` is invalid. This could be a bug of evtd.`)
  return {}
}

function ensureTrapHandlers (
  name: TrapEventNames,
  el: Element,
  handler: (e: Event) => any
): TrapHandlers {
  const handlers = traps[name]
  let elHandlers = handlers.get(el)
  if (elHandlers === undefined) {
    handlers.set(
      el,
      elHandlers = new WeakMap()
    )
  }
  let trapHandler = elHandlers.get(handler)
  if (trapHandler === undefined) {
    elHandlers.set(
      handler,
      trapHandler = createTrapHandler(
        name,
        el,
        handler
      )
    )
  }
  return trapHandler
}

function trapOn (
  name: TrapEventNames,
  el: Element,
  handler: (e: Event) => any,
  options?: boolean | EventListenerOptions
): boolean {
  if (
    name === 'mousemoveoutside' ||
    name === 'clickoutside'
  ) {
    const trapHandlers = ensureTrapHandlers(name, el, handler)
    Object.keys(trapHandlers).forEach(key => {
      on(key, document, trapHandlers[key], options as any)
    })
    return true
  }
  return false
}

function trapOff (
  name: TrapEventNames,
  el: Element,
  handler: (e: Event) => any,
  options?: boolean | EventListenerOptions
): boolean {
  if (
    name === 'mousemoveoutside' ||
    name === 'clickoutside'
  ) {
    const trapHandlers = ensureTrapHandlers(name, el, handler)
    Object.keys(trapHandlers).forEach(key => {
      off(key, document, trapHandlers[key], options as any)
    })
    return true
  }
  return false
}

export {
  trapOff,
  trapOn
}
