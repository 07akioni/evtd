<template>
  <click-outside />
  <mouse-move-outside />
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