<template>
  <div>
    <button @click="toggle">Move Outside Area: {{ on ? 'on' : 'off' }}</button>
    <div ref="area" style="background: royalblue; width: 100%; height: 100px; color: white; display: flex; align-items: center; justify-content: center;">
      Area {{ moveOutside ? 'Move Outside' : '' }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  on,
  off
} from '../src/index'

export default defineComponent({
  name: 'ClickOutside',
  data () {
    return {
      on: false,
      timerId: undefined as (number | undefined),
      moveOutside: false
    }
  },
  methods: {
    handleMoveOutside () {
      const {
        timerId
      } = this
      if (timerId) {
        window.clearTimeout(timerId)
      }
      this.moveOutside = true
      this.timerId = window.setTimeout(() => {
        this.moveOutside = false
      }, 64)
    },
    toggle () {
      if (this.on) {
        this.on = false
        off('mousemoveoutside', this.$refs.area as Element, this.handleMoveOutside)
      } else {
        this.on = true
        on('mousemoveoutside', this.$refs.area as Element, this.handleMoveOutside)
      }
    }
  }
})
</script>