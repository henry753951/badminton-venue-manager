<template>
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">球場管理</h1>
      <Button label="創建新球場" @click="showForm = true" class="mb-4" />
      <CourtList v-model:create-modal="showForm" />

    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import Button from "primevue/button";
  import CourtList from "~/components/admin/CourtList.vue";
  
  const showForm = ref(false);
  
  </script>