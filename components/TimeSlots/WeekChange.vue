<template>
  <div class="flex justify-between items-center mb-4">
    <Button
      size="small"
      :text="breakpoints.smallerOrEqual('md').value"
      @click="$emit('onPrev')"
    >
      <Icon
        name="mdi-chevron-left"
        class="md:hidden"
      />
      <div class="md:block hidden">
        上一週
      </div>
    </Button>
    <div class="flex-grow px-3 flex-center min-w-0">
      <div>{{ currentDate }}</div>
    </div>
    <Button
      size="small"
      :text="breakpoints.smallerOrEqual('md').value"
      @click="$emit('onNext')"
    >
      <div class="md:block hidden">
        下一週
      </div>
      <Icon
        name="mdi-chevron-right"
        class="md:hidden"
      />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";

defineProps({
  currentDate: {
    type: String,
    required: true,
  },
});

defineEmits(["onPrev", "onNext"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
</script>
