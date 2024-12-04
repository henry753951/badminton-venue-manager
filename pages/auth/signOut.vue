<template>
  <div></div>
</template>

<script lang="ts" setup>
definePageMeta({ name: "signOut" });

onMounted(() => {
  const auth = useAuth();
  auth.signOut();
});
</script>

<style></style>
