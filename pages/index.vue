<template>
  <div>
    {{ user }}
    <Button @click="auth.refresh()">
      1
    </Button>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ name: "home" });
const auth = useAuth();
const user = await auth.data;
</script>

<style></style>
