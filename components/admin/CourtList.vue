<template>
  <div>
    <DataTable
      :value="courts"
      :loading="loading"
      class="p-datatable-striped"
    >
      <Column
        field="name"
        header="名稱"
      ></Column>
      <Column
        field="location"
        header="地點"
      ></Column>

      <Column>
        <template #body="slotProps">
          <Button
            label="管理預約"
            @click="navigateToCourt(slotProps.data.id)"
            class="p-button-sm"
          />
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button
            label="刪除"
            @click="deleteCourt(slotProps.data.id)"
            class="p-button-sm p-button-danger"
          />
        </template>
      </Column>
    </DataTable>
    <Dialog
      v-model:visible="showForm"
      header="創建新球場"
      :modal="true"
    >
      <CourtForm @save="createCourt" />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import { useApi } from "~/composables/useApi";
import Dialog from "primevue/dialog";
import CourtList from "~/components/admin/CourtList.vue";
import CourtForm from "~/components/admin/CourtForm.vue";

const api = useApi();
const courts = ref([]);
const loading = ref(true);

const showForm = defineModel("create-modal", {
    default: false,
});

onMounted(async () => {
    const response = await api.fetchCourts();
    courts.value = response.courtsData.value;
    loading.value = false;
});

const deleteCourt = async (courtId) => {
    if (confirm("確定要刪除此球場嗎？")) {
        await api.deleteCourt(courtId);
        const response = await api.fetchCourts();
        courts.value = response.courtsData.value;
    }
};


const createCourt = async (newCourt) => {
    await useApi().createCourt(newCourt);
    const response = await api.fetchCourts();
    courts.value = response.courtsData.value;
    showForm.value = false;
};

const navigateToCourt = (courtId) => {
   navigateTo(`/dashboard/admin/courts/${courtId}`);
};
</script>