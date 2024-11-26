<template>
  <div :class="align === 'right' ? 'right-0 pr-2' : 'left-0 pl-2'">
    <div
      v-for="hour in timeLabels"
      :key="hour"
      class="absolute text-sm text-gray-600"
      :style="{
        top: `${(Number(hour) - startHour) * columnHeight * 2}px`,
      }"
    >
      {{ hour }}:00
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  timeLabels: {
    type: Array as () => Array<string | number>,
    required: true,
  },
  align: {
    type: String,
    default: "left",
    validator: (value: string) => ["left", "right"].includes(value),
  },
  startHour: {
    type: Number,
    required: true,
  },
  columnHeight: {
    type: Number,
    required: true,
  },
});
</script>
