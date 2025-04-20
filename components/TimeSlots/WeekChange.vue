<template>
  <div class="flex justify-between items-center mb-4">
    <Button
      size="small"
      :text="breakpoints.smallerOrEqual('md').value"
      @click="$emit('onPrev')"
      :disabled="!canChangeWeek.prev"
    >
      <Icon
        name="mdi-chevron-left"
        class="md:hidden"
      />
      <div class="md:block hidden">
        上一週
      </div>
    </Button>
    <div class="flex-grow px-3 flex-center min-w-0 flex-col gap-3">
      <div
        font-bold
        text-lg
      >
        {{ currentDate }}
      </div>
      <slot />
    </div>
    <Button
      size="small"
      :text="breakpoints.smallerOrEqual('md').value"
      @click="$emit('onNext')"
      :disabled="!canChangeWeek.next"
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
  canChangeWeek: {
    type: Object as () => {
      prev: boolean;
      next: boolean;
    },
    required: false,
    default: () => ({
      prev: true,
      next: true,
    }),
  },
});

defineEmits(["onPrev", "onNext"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
</script>
