<template>
  <div
    flex
    flex-col
  >
    <SelectButton
      v-model="currentPage"
      :options="pages"
      option-label="name"
      size="large"
      class="p-2 mx-auto w-full full-button container"
    />
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
// Composables
const route = useRoute();

// States
const pages = ref([
  {
    name: "建立課程",
    value: "createLesson",
    routeName: "dashboard-coach-createLesson",
  },
  {
    name: "課程列表",
    value: "lessons",
    routeName: "dashboard-coach-lessons",
  }
]);

// Computed
const currentPage = computed({
  get: () => {
    const value = pages.value.find((page) => page.routeName ===  route.name);
    return value;
  },
  set: (value: { name: string; value: string; routeName: string }) => {
    navigateTo({
      name: value.routeName,
    });
  },
});

// Methods

// Lifecycle Hooks
onMounted(() => {

});
</script>

<style>
.full-button .p-togglebutton {
  width: 100%;
}
</style>
