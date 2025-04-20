<template>
    <div class="flex flex-col gap-4 p-4">
        <div class="p-field">
            <label for="name">名稱</label>
            <InputText id="name" v-model="localUser.name" />
        </div>
        <div class="p-field">
            <label for="email">電子郵件</label>
            <InputText id="email" v-model="localUser.email" />
        </div>
        <div class="p-field">
            <label for="roles">角色</label>
            <MultiSelect id="roles" v-model="localUser.roles" :options="roles" optionLabel="description"
                optionValue="id" />
        </div>
        <Button label="保存" @click="save" />
    </div>
</template>
<style lang="css" scoped>
.p-field {
    display: flex;
    flex-direction: column;
    width: 400px;
}
</style>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";
import { useApi } from "~/composables/useApi";

const props = defineProps({
    user: {
        type: Object,
        required: true,
        default: () => ({
            id: "",
            name: "",
            email: "",
            roles: [],
        }),
    },
});

const emit = defineEmits(["save"]);

const api = useApi();
const localUser = ref({ ...props.user });
const roles = ref([]);

onMounted(async () => {
    const response = await api.fetchRoles();
    roles.value = response.data;
});

const save = () => {
    emit("save", localUser.value);
};
</script>