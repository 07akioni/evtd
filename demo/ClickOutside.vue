<template>
  <div>
    <button @click="toggle">Click Outside Area: {{ on ? 'on' : 'off' }}</button>
    <div ref="area" style="background: royalblue; width: 100%; height: 100px; color: white; display: flex; align-items: center; justify-content: center;">
      Area {{ clickOutside ? 'Click Outside' : '' }}
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
      clickOutside: false
    }
  },
  methods: {
    handleClickOutside () {
      const {
        timerId
      } = this
      if (timerId) {
        window.clearTimeout(timerId)
      }
      this.clickOutside = true
      this.timerId = window.setTimeout(() => {
        this.clickOutside = false
      }, 1000)
    },
    toggle () {
      if (this.on) {
        this.on = false
        off('clickoutside', this.$refs.area as Element, this.handleClickOutside)
      } else {
        this.on = true
        on('clickoutside', this.$refs.area as Element, this.handleClickOutside)
      }
    }
  }
})
</script>