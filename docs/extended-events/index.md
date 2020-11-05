# Extended Events
Evtd has some extend events, you can use them the same as other events.

## Support Events
- `clickoutside`
- `mousemoveoutside`

## Example
```js
import { on, off } from 'evtd'

const handleClickOutside = (e) => console.log('clickoutside', e)

on('clickoutside', el, handleClickOutside)
off('clickoutside', el, handleClickOutside
```