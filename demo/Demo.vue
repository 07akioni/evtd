<template>
  <click-outside />
  <mouse-move-outside />
  <button id="test-click">Test Click</button>
  <div class="outer">
    <div class="inner" />
  </div>
</template>

<script>
import ClickOutside from './ClickOutside.vue'
import MouseMoveOutside from './MouseMoveOutside.vue'

export default {
  components: {
    ClickOutside,
    MouseMoveOutside
  }
}
</script>