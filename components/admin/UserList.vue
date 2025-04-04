<template>
    <div>
        <DataTable :value="users" :loading="loading" class="p-datatable-striped">
            <Column field="name" header="名稱"></Column>
            <Column field="email" header="電子郵件"></Column>
            <Column field="roles" header="角色">
                <template #body="slotProps">
                    <span>{{ slotProps.data.roles_name.join(", ") }}</span>
                </template>
            </Column>
            <Column>
                <template #body="slotProps">
                    <Button label="編輯" @click="editUser(slotProps.data)" class="p-button-sm p-button-outlined" />
                    <Button label="刪除" @click="deleteUser(slotProps.data.id)"
                        class="p-button-sm p-button-danger ml-2" />
                </template>
            </Column>
        </DataTable>
        <Dialog v-model:visible="showForm" header="編輯用戶" :modal="true">
            <UserForm :user="selectedUser" @save="saveUser" />
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import UserForm from "./UserForm.vue";
import { useApi } from "~/composables/useApi";

const api = useApi();
const users = ref([]);
const loading = ref(true);
const showForm = ref(false);
const selectedUser = ref(null);

onMounted(async () => {
    const response = await api.fetchUsers();
    users.value = response.data;
    loading.value = false;
});

const editUser = (user) => {
    selectedUser.value = user;
    showForm.value = true;
};

const saveUser = async (updatedUser) => {
    await api.updateUser(updatedUser.id, updatedUser);
    showForm.value = false;
    const response = await api.fetchUsers();
    users.value = response.data;
};

const deleteUser = async (userId) => {
    if (confirm("確定要刪除此用戶嗎？")) {
        await api.deleteUser(userId);
        const response = await api.fetchUsers();
        users.value = response.data;
    }
};
</script>