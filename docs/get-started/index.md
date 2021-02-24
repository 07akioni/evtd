# Get Started
## Installation
```bash
npm install --save-dev evtd
```
## Basic Usage
```ts
import { on, off } from 'evtd'

function handleClick () {
  console.log('click')
}

// register event
on(window, 'click', handleClick)
on(document, 'click', handleClick)
on(eventTarget, 'click', handleClick)

// evtd has 2 extended events
on(eventTarget, 'clickoutside', handleClick)
on(eventTarget, 'mousemoveoutside', handleClick)

// unregister
const handleClick2 = () => console.log('click2')
on(eventTarget, 'click', handleClick2)
off(eventTarget, 'click', handleClick2)

// capture
on(eventTarget, 'click', handleClick2, true)
off(eventTarget, 'click', handleClick2, true)
```