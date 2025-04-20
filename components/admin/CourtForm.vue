<template>
    <div class="flex flex-col gap-4 p-4">
        <div class="p-field">
            <label for="name">名稱</label>
            <InputText id="name" v-model="newCourt.name" />
        </div>
        <div class="p-field">
            <label for="location">地點</label>
            <InputText id="location" v-model="newCourt.location" />
        </div>
        <Button label="保存" @click="save" />
    </div>
</template>

<script setup>
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const newCourt = ref({ name: "", location: "" });

const save = () => {
    emit("save", newCourt.value);
};

const emit = defineEmits(["save"]);
</script>

<style scoped lang="css">
.p-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>