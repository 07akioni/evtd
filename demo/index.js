import { createApp } from 'vue'
import Demo from './Demo.vue'
// import {on, off} from '../src/index'

createApp(Demo).mount('#app')

// on('click', document.body, (e) => console.log('click body', e.currentTarget))
// on('click', document.getElementById('test-click'), (e) => console.log('click button', e.currentTarget))
// document.body.dispatchEvent(new Event('click', {
//   bubbles: true
// }))

// // test current target
// const outer = document.querySelector('.outer')
// const inner = document.querySelector('.inner')

// const path = [document.body, outer, inner]
// path.forEach((_, index) => {
//   const subPath = path.slice(index)
//   if (subPath.length === 0) return
//   const attachTo = subPath[0]
//   if (attachTo === document.body || attachTo === outer) {
//     on('click', attachTo, (e) => {
//       console.log('attachTo', attachTo, e.currentTarget, e.detail)
//       console.log(e.currentTarget === e.detail)
//     })
//     subPath.forEach(target => {
//       target.dispatchEvent(new CustomEvent('click', {
//         detail: attachTo,
//         bubbles: true
//       }))
//     })
//   }
// })