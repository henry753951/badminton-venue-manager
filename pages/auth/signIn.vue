<script setup lang="ts">
definePageMeta({
  name: "signIn",
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
});
// Composables
const breadcrumbStore = useBreadcrumbStore();
const { signIn, getProviders } = useAuth();

// State
const providers = await getProviders();
const loading = ref<{ [key: string]: boolean }>({});

const icons = {
  discord: "fa-brands:discord",
  google: "fa-brands:google",
  line: "fa-brands:line",
};

// Methods
const handleSignIn = async (providerId: string) => {
  try {
    loading.value[providerId] = true;
    await signIn(providerId);
  } catch (error) {
    console.error("Sign-in error:", error);
  } finally {
    loading.value[providerId] = false;
  }
};

// Lifecycle Hooks
onMounted(async () => {
  breadcrumbStore.breadcrumbs = [
    {
      label: "首頁",
      route: { name: "home" },
    },
    {
      label: "登入",
      route: undefined,
    },
  ];
});
</script>

<template>
  <div class="flex justify-center my-auto pb-4rem">
    <Card class="w-full max-w-md shadow-lg">
      <template #header>
        <div class="bg-primary-500 text-center pt-4">
          <h2 class="text-2xl font-bold">
            歡迎回來
          </h2>
          <p class="text-sm text-primary-100">
            登入以繼續
          </p>
        </div>
      </template>

      <template #content>
        <div class="flex flex-col gap-4">
          <Button
            v-for="provider in providers"
            :key="provider?.id"
            :loading="provider?.id ? loading[provider.id] : false"
            @click="provider?.id && handleSignIn(provider.id)"
            severity="secondary"
          >
            <Icon
              :name="icons[provider?.id as keyof typeof icons]"
              class="text-xl"
            />
            Sign in with {{ provider?.name }}
          </Button>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.pi-github {
  color: #333;
}
.pi-google {
  color: #4285f4;
}
.pi-microsoft {
  color: #00a4ef;
}
</style>
