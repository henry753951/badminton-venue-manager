<script setup lang="ts">
import { ref } from 'vue';

const menuItems = ref([
    { label: '管理使用者', to: '/dashboard/admin/users' },
    { label: '管理場地', to: '/dashboard/admin/courts' },
    { label: '管理教練', to: '/dashboard/coach' },
]);
</script>

<template>
    <div class="flex flex-col h-screen">
        <header class="bg-gray-100 p-4 border-t flex justify-around">
            <nav>
                <ul class="flex gap-4">
                    <li v-for="item in menuItems" :key="item.to">
                        <NuxtLink :to="item.to" class="text-blue-500 hover:underline">
                            {{ item.label }}
                        </NuxtLink>
                    </li>
                </ul>
            </nav>
        </header>
        <!-- Main Content -->
        <main class="flex-1 p-4">
            <NuxtPage />
        </main>


    </div>
</template>

<style>
/* Add any additional UnoCSS or custom styles here if needed */
</style>