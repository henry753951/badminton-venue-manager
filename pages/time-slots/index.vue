<template>
  <div class="p-4 container mx-auto">
    <div class="flex justify-between items-center mb-4 flex-wrap gap-3">
      <h1 class="text-2xl font-bold">
        場地清單
      </h1>
      <div class="flex gap-2 w-full md:w-fit">
        <div class="w-full flex gap-4">
          <InputText
            v-model="filter.name"
            placeholder="搜尋場地名稱"
            class="w-full"
            @keyup.enter="search(filter.name, filter.location)"
          />
          <InputText
            v-model="filter.location"
            placeholder="搜尋場地位置"
            class="w-full"
            @keyup.enter="search(filter.name, filter.location)"
          />
        </div>
        <Button
          severity="secondary"
          @click="search(filter.name, filter.location)"
        >
          <Icon name="fa:search" />
        </Button>
      </div>
    </div>

    <div
      v-if="status === 'pending'"
      class="flex justify-center items-center h-15rem"
    >
      <ProgressSpinner
        style="width: 50px; height: 50px"
        stroke-width="8"
        fill="transparent"
        animation-duration=".5s"
        aria-label="Custom ProgressSpinner"
      />
    </div>

    <div
      v-else-if="courtsData?.length === 0"
      class="text-center text-gray-500 py-8"
    >
      查無場地資料
    </div>

    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <Card
        v-for="court in courtsData"
        :key="court.id"
        class="hover:shadow-lg transition-shadow duration-300 overflow-hidden"
      >
        <template #header>
          <div
            class="min-h-48 bg-gray-200 flex items-center justify-center text-gray-500"
            :style="{ backgroundImage: `url(${court.image_url})` }"
          ></div>
        </template>

        <template #title>
          {{ court.name }}
        </template>

        <template #content>
          <div class="flex items-center gap-2 mb-2">
            <i class="pi pi-map-marker text-primary"></i>
            <span>{{ court.location }}</span>
          </div>
        </template>

        <template #footer>
          <div class="flex justify-end">
            <Button
              label="查看時段"
              severity="primary"
              @click="goToTimeSlots(court.id)"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ name: "timeSlots-courts" });

// Composables
const breadcrumbStore = useBreadcrumbStore();

// State
const filter = ref({
  name: "",
  location: "",
});

// Fetch hook
const { courtsData, search, status } = await useApi().fetchCourts();

// Methods
const goToTimeSlots = (courtId: string) => {
  navigateTo({
    name: "timeSlots-courtId",
    params: {
      courtId: courtId,
    },
  });
};

// Lifecycle Hooks
onMounted(() => {
  breadcrumbStore.breadcrumbs = [
    {
      label: "首頁",
      route: { name: "home" },
    },
    {
      label: "場地租借",
      route: undefined,
    },
  ];
});
</script>

<style scoped></style>
