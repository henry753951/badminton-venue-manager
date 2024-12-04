<template>
  <div></div>
</template>

<script lang="ts" setup>
import { format, startOfWeek, endOfWeek } from "date-fns";
definePageMeta({
  name: "timeSlots-courtId",
});

const route = useRoute();

const getCurrentWeek = () => {
  const today = new Date();
  const startDate = startOfWeek(today, { weekStartsOn: 0 });
  const endDate = endOfWeek(today, { weekStartsOn: 0 });

  return {
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: format(endDate, "yyyy-MM-dd"),
  };
};

onMounted(() => {
  navigateToCurrentWeek();
});

const navigateToCurrentWeek = () => {
  const currentWeek = getCurrentWeek();
  navigateTo({
    replace: true,
    name: "timeSlots-courtId-startDate-endDate",
    params: {
      courtId: route.params.courtId,
      startDate: currentWeek.startDate,
      endDate: currentWeek.endDate,
    },
  });
};
</script>

<style></style>
