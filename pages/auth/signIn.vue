<script setup lang="ts">
definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
});

const { signIn, getProviders } = useAuth();
const providers = await getProviders();
</script>

<template>
  <div>
    <Button
      v-for="provider in providers"
      :key="provider?.id"
      @click="signIn(provider?.id)"
    >
      Sign in with {{ provider?.name }}
    </Button>
  </div>
</template>
