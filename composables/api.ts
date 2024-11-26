import { format, parse, addWeeks, startOfWeek, endOfWeek, addDays } from "date-fns";

export interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
}

export const useApi = () => {
  return {
    fetchSchedule: async (courtId: string, startDate: Date, endDate: Date) => {
      const inputs = ref({
        courtId,
        startDate,
        endDate,
      });
      const { data, status, refresh } = useAsyncData(
        `time-slots-${inputs.value.courtId}-${inputs.value.startDate}-${inputs.value.endDate}`,
        async () => {
          try {
            const { data } = await useFetch("/api/time-slots", {
              method: "GET",
              params: {
                court_id: inputs.value.courtId,
                startDate: format(inputs.value.startDate, "yyyy-MM-dd"),
                endDate: format(inputs.value.endDate, "yyyy-MM-dd"),
              },
            });

            return data.value?.data ?? [];
          } catch (error) {
            console.error("Failed to fetch schedule:", error);
            return [];
          }
        },
      );

      return {
        status,
        scheduleData: data,
        refresh,
      };
    },
    fetchCourts: async (
      name: string | undefined = undefined,
      location: string | undefined = undefined,
    ) => {
      const inputs = ref({
        name,
        location,
      });

      const { data, status, refresh } = await useAsyncData(
        "courts",
        async () => {
          const { data, refresh } = await useFetch("/api/courts", {
            query: {
              name: inputs.value.name,
              location: inputs.value.location,
            },
            transform: (response) => response.data || [],
          });
          return data.value;
        },
        { lazy: true },
      );

      const search = (name: string, location: string) => {
        inputs.value.name = name;
        inputs.value.location = location;
        refresh();
      };
      return {
        status,
        courtsData: data,
        search,
      };
    },
    fetchCourt: async (id: string, lazy = true) => {
      const { data, status, refresh } = await useAsyncData(
        `court-${id}`,
        async () => {
          const { data } = await useFetch(`/api/courts/${id}`, {
            method: "GET",
          });
          return data.value?.data ?? null;
        },
        { lazy: lazy },
      );

      return {
        status,
        courtData: data,
        refresh,
      };
    },
    createBooking: async (data: {
      courtId: string;
      date: string;
      startTime: string;
      endTime: string;
    }) => {
      const {
        data: response,
        status,
        error,
      } = await useFetch("/api/bookings", {
        method: "POST",
        body: data,
      });

      return {
        status,
        data: response.value,
        error,
      };
    },
    getBookings: async (userId: string = "me") => {
      const { data, status, refresh } = await useAsyncData(`bookings-${userId}`, async () => {
        const { data } = await useFetch("/api/bookings", {
          method: "GET",
          query: {
            userId: userId,
          },
        });
        return data.value?.data ?? [];
      });

      return {
        status,
        bookingsData: data,
        refresh,
      };
    },
    deleteBooking: async (bookingId: string) => {
      const { data, status, error } = await useFetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      return {
        status,
        data: data.value,
        error,
      };
    },
  };
};
