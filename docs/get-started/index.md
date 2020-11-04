# Get Started
## Installation
```bash
npm install --save-dev evtd
```
## Usage
```js
import { on, off } from 'evtd'

function handleClick () {
  console.log('click')
}

on('click', document.querySelector('x'), handleClick)
off('click', document.querySelector('x'), handleClick)
```