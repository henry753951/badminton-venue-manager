<template>
  <div class="p-4 mx-auto container">
    <h1 class="text-2xl font-bold mb-6 text-gray-800 dark:text-light-3">
      我的預約
    </h1>

    <div
      v-if="bookingsData && bookingsData.length"
      class="grid gap-4"
    >
      <Card
        v-for="booking in bookingsData"
        :key="booking.id"
        class="shadow-sm hover:shadow-md transition-all"
      >
        <template #content>
          <div class=" relative">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <img
                  v-if="booking.timeSlot.court.image_url"
                  :src="booking.timeSlot.court.image_url"
                  :alt="booking.timeSlot.court.name"
                  class="w-24 h-24 object-cover rounded-lg"
                />
                <div
                  v-else
                  class="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-lg dark:bg-light-3"
                >
                  <Icon
                    name="mdi:image-outline"
                    class="text-3xl text-gray-500 dark:text-gray-400"
                  />
                </div>
              </div>
  
              <div class="flex-grow">
                <div class="flex justify-between items-center mb-2">
                  <h2 class="text-xl font-semibold text-gray-700 dark:text-light-3">
                    {{ booking.timeSlot.court.name }}
                  </h2>
                </div>
  
                <div class="space-y-1 text-gray-600 dark:text-gray-400">
                  <div class="flex items-center space-x-2">
                    <Icon
                      name="mdi:calendar"
                      class="text-blue-500"
                    />
                    <span>
                      {{ formatDate(booking.timeSlot.date, "yyyy/MM/dd") }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Icon
                      name="mdi:clock-outline"
                      class="text-green-500"
                    />
                    <span>
                      {{ booking.timeSlot.startTime }} -
                      {{ booking.timeSlot.endTime }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Icon
                      name="mdi:map-marker"
                      class="text-red-500"
                    />
                    <span>{{ booking.timeSlot.court.location }} - {{ booking.timeSlot.court.name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="md:absolute md:w-auto mt-3 w-full bottom-0 right-4">
              <Button
                icon-class="mr-2"
                severity="danger"
                class="w-full"
                @click="cancelBooking(booking.id)"
              >
                <Icon
                  name="mdi:trash-can"
                  class="mr-2"
                />
                取消預約
              </Button>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div
      v-else
      class="text-center bg-gray-100 p-8 rounded-lg flex-center flex-col"
    >
      <Icon
        name="mdi:calendar-remove"
        class="text-6xl text-gray-400 mb-4 block"
      />
      <p class="text-xl text-gray-600">
        沒有預約
      </p>
      <Button
        @click="createNewBooking"
        class="mt-4"
      >
        預約場地
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from "date-fns";
definePageMeta({ name: "user-bookings", middleware: "auth" });

const route = useRoute();
const userId = ref(route.params.id as string);
const { bookingsData, refresh } = await useApi().fetchBookings(userId.value);

const cancelBooking = async (bookingId: string) => {
  const response = await useApi().deleteBooking(bookingId);
  refresh();
};

const createNewBooking = () => {
  navigateTo({
    name: "timeSlots-courts",
  });
};
</script>
