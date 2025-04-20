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

export interface Court {
  id: string;
  name: string;
  location: string;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export const useApi = () => {
  return {
    fetchNews: async () => {
      const { data, status, refresh } = await useAsyncData(
        "news",
        async () => {
          const { data } = await useFetch("/api/news", {
            method: "GET",
          });
          return data.value?.data ?? [];
        },
        { lazy: true },
      );

      return {
        status,
        newsData: data,
        refresh,
      };
    },

    fetchNewsItem: async (newsId: string) => {
      const { data, status, refresh } = await useAsyncData(
        `news-${newsId}`,
        async () => {
          const { data } = await useFetch(`/api/news/${newsId}`, {
            method: "GET",
          });
          return data.value?.data ?? null;
        },
        { lazy: false },
      );

      return {
        status,
        newsItemData: data,
        refresh,
      };
    },

    createNews: async (newsData: {
      title: string;
      summary: string;
      content: string;
      image_url?: string;
    }) => {
      const {
        data: response,
        status,
        error,
      } = await useFetch("/api/news", {
        method: "POST",
        body: newsData,
      });
      return { status, data: response.value, error };
    },

    updateNews: async (
      newsId: string,
      newsData: {
        title: string;
        summary: string;
        content: string;
        image_url?: string;
      },
    ) => {
      const {
        data: response,
        status,
        error,
      } = await useFetch(`/api/news/${newsId}`, {
        method: "PUT",
        body: newsData,
      });
      return { status, data: response.value, error };
    },

    deleteNews: async (newsId: string) => {
      const { data, status, error } = await useFetch(`/api/news/${newsId}`, {
        method: "DELETE",
      });
      return { status, data: data.value, error };
    },
    fetchSchedule: async (courtId: Ref<string>, startDate: Ref<Date>, endDate: Ref<Date>) => {
      const { data, status, refresh } = await useAsyncData(
        `time-slots-${courtId.value}-${startDate.value}-${endDate.value}`,
        async () => {
          try {
            const { data } = await useFetch("/api/time-slots", {
              method: "GET",
              params: {
                court_id: courtId.value,
                startDate: format(startDate.value, "yyyy-MM-dd"),
                endDate: format(endDate.value, "yyyy-MM-dd"),
              },
            });

            return data.value?.data ?? [];
          } catch (error) {
            console.error("Failed to fetch schedule:", error);
            return [];
          }
        },
        { lazy: true },
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

      const { data, refresh, status } = await useFetch("/api/courts", {
        query: {
          name: inputs.value.name,
          location: inputs.value.location,
        },
        transform: (response) => response.data || [],
      });

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
    fetchCourt: async (id: Ref<string>) => {
      const { data, status, refresh } = await useAsyncData(
        `court-${id.value}`,
        async () => {
          const { data } = await useFetch(`/api/courts/${id.value}`, {
            method: "GET",
          });
          return data.value?.data ?? null;
        },
        { lazy: false },
      );

      return {
        status,
        courtData: data,
        refresh,
      };
    },
    createCourt: async (data: { name: string; location: string }) => {
      const {
        data: response,
        status,
        error,
      } = await useFetch("/api/courts", {
        method: "POST",
        body: data,
      });
      return { status, data: response.value, error };
    },

    deleteCourt: async (courtId: string) => {
      const { data, status, error } = await useFetch(`/api/courts/${courtId}`, {
        method: "DELETE",
      });
      return { status, data: data.value, error };
    },

    fetchBookings: async (userId: string = "me") => {
      const { data, status, refresh } = await useAsyncData(
        `bookings-${userId}`,
        async () => {
          const { data } = await useFetch("/api/bookings", {
            method: "GET",
            query: {
              userId: userId,
            },
          });
          return data.value?.data ?? [];
        },
        { lazy: true },
      );

      return {
        status,
        bookingsData: data,
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
    deleteTimeSlot: async (timeSlotId: string) => {
      const { data, status, error } = await useFetch(`/api/time-slots/${timeSlotId}`, {
        method: "DELETE",
      });
      return {
        status,
        data: data.value,
        error,
      };
    },
    fetchLessons: async (data: {
      userId: Ref<string | undefined>;
      coachId: Ref<string | undefined>;
      filter: Ref<
        | {
            startTime: string | undefined;
            endTime: string | undefined;
            courtId: string | undefined;
            name: string | undefined;
          }
        | undefined
      >;
    }) => {
      const {
        data: lessonsData,
        status,
        refresh,
      } = await useAsyncData(
        `lessons-${data.userId.value}-${data.coachId.value}`,
        async () => {
          const { data: lessonsData } = await useFetch("/api/coach-lessons", {
            method: "GET",
            query: {
              userId: data.userId.value,
              coachId: data.coachId.value,
              startTime: data.filter.value?.startTime,
              endTime: data.filter.value?.endTime,
              courtId: data.filter.value?.courtId,
              name: data.filter.value?.name,
            },
          });
          return lessonsData.value?.data;
        },
        { lazy: true },
      );
      return {
        lessonsData,
        status,
        refresh,
      };
    },
    updateLesson: async (
      lessonId: string,
      data: { title: string; description: string; courtId: string },
    ) => {
      const {
        data: response,
        status,
        error,
      } = await useFetch(`/api/coach-lessons/${lessonId}`, {
        method: "PUT",
        body: data,
      });

      return {
        status,
        data: response.value,
        error,
      };
    },
    fetchLesson: async (lessonId: Ref<string>) => {
      const { data, status, refresh } = await useAsyncData(
        `lesson-${lessonId}`,
        async () => {
          const { data } = await useFetch(`/api/coach-lessons/${lessonId.value}`, {
            method: "GET",
          });
          return data.value?.data ?? null;
        },
        { lazy: false },
      );

      return {
        status,
        lessonData: data,
        refresh,
      };
    },
    deleteLesson: async (lessonId: string) => {
      const { data, status, error } = await useFetch(`/api/coach-lessons/${lessonId}`, {
        method: "DELETE",
      });

      return {
        status,
        data: data.value,
        error,
      };
    },
    createLesson: async (data: {
      courtId: string;
      date: string;
      startTime: string;
      endTime: string;
      title: string;
      description: string;
    }) => {
      const {
        data: response,
        status,
        error,
      } = await useFetch("/api/coach-lessons", {
        method: "POST",
        body: {
          courtId: data.courtId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          lesson: {
            title: data.title,
            description: data.description,
          },
        },
      });

      return {
        status,
        data: response.value,
        error,
      };
    },
    signUpLesson: async (lessonId: string) => {
      const {
        data: response,
        status,
        error,
      } = await useFetch(`/api/coach-lessons/${lessonId}/signup`, {
        method: "POST",
      });

      return {
        status,
        data: response.value,
        error,
      };
    },
    fetchUsers: async () => {
      const { data } = await useFetch("/api/users", {
        method: "GET",
      });
      return data.value;
    },

    updateUser: async (userId: string, data: any) => {
      const {
        data: response,
        status,
        error,
      } = await useFetch(`/api/users/${userId}`, {
        method: "POST",
        body: data,
      });
      return { status, data: response.value, error };
    },

    deleteUser: async (userId: string) => {
      const { data, status, error } = await useFetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      return { status, data: data.value, error };
    },

    fetchRoles: async () => {
      const { data } = await useFetch("/api/roles", {
        method: "GET",
      });
      return data.value;
    },
  };
};
