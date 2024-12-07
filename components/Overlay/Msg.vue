<template>
  <div
    relative
    w-full
    h-full
  >
    <div
      v-if="show"
      z-10
      absolute
      top-0
      left-0
      right-0
      bottom-0
      h-full
      w-full
      backdrop-blur-sm
      transform-scale-105
      transform-origin-top
    >
      <div
        class="flex flex-center h-full w-full z-10 p-5"
      >
        <slot name="overlay">
          <p
            font-bold
            text-lg
          >
            {{ msg }}
          </p>
        </slot>
      </div>
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  msg: {
    type: String,
    default: "載入中...",
  },
});
</script>

<style scoped>

</style>
