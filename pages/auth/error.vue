<script setup lang="ts">
definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
});

const route = useRoute();
const errorCode = computed(() => route.query.error);
</script>

<template>
  <h1>Authentication error {{ errorCode }}. Please try again!</h1>
</template>
