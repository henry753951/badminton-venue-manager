<template>
  <nav
    class="flex items-center p-4 bg-white dark:bg-black shadow-sm fixed top-0 left-0 right-0 z-50 md:gap-10"
  >
    <!-- Logo / 品牌名稱 -->
    <div class="flex items-center">
      <NuxtLink
        to="/"
        class="flex items-center"
      >
        <span class="text-xl font-bold text-gray-800 dark:text-white">
          場地租借系統
        </span>
      </NuxtLink>
    </div>

    <!-- 桌面導航鏈接 -->
    <div class="hidden md:flex space-x-6">
      <NuxtLink
        to="/"
        class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
      >
        首頁
      </NuxtLink>
      <NuxtLink
        to="/coach-lessons"
        class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
      >
        教練課程
      </NuxtLink>
      <NuxtLink
        to="/timeSlots"
        class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
      >
        場地租借
      </NuxtLink>
    </div>

    <!-- 用戶操作區域 -->
    <div class="flex items-center space-x-4 ms-auto">
      <!-- 登入/註冊 按鈕 -->
      <template v-if="!isAuthenticated">
        <NuxtLink to="/login">
          <Button
            label="登入"
            class="p-button-outlined p-button-sm text-gray-700 dark:text-gray-300"
          />
        </NuxtLink>
        <NuxtLink to="/register">
          <Button
            label="註冊"
            class="p-button-primary p-button-sm"
          />
        </NuxtLink>
      </template>

      <!-- 用戶菜單 -->
      <template v-else>
        <Dropdown
          :options="userMenuOptions"
          option-label="label"
          placeholder="用戶選單"
          class="text-gray-700 dark:text-gray-300"
          dropdown-icon="pi pi-chevron-down"
        />
      </template>

      <!-- 漢堡菜單（移動設備） -->
      <div md:hidden>
        <Button @click="toggleMobileMenu">
          <Icon
            name="line-md:menu"
            dark:text-gray-700
            text-gray-300
          />
        </Button>
      </div>

      <!-- 暗黑模式切換 -->
      <div
        hidden
        md:block
        ms-2
      >
        <Button
          @click="toggleColorMode"
          text
        >
          <Icon
            class="dark:text-gray-100"
            :name="colorModeIcon"
          />
        </Button>
      </div>
    </div>

    <!-- 移動設備菜單 -->
    <Drawer
      v-model:visible="mobileMenuVisible"
      position="right"
      :modal="true"
      :dismissable="true"
    >
      <div class="flex flex-col space-y-4 p-4 h-full">
        <NuxtLink
          to="/"
          class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          @click="toggleMobileMenu"
        >
          首頁
        </NuxtLink>
        <NuxtLink
          to="/coach-lessons"
          class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          @click="toggleMobileMenu"
        >
          教練課程
        </NuxtLink>
        <NuxtLink
          to="/timeSlots"
          class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          @click="toggleMobileMenu"
        >
          場地租借
        </NuxtLink>
        <hr class="border-gray-300 dark:border-gray-600" />
        <div class="h-full flex flex-col gap-2">
          <div>
            <template v-if="!isAuthenticated">
              <NuxtLink
                to="/login"
                @click="toggleMobileMenu"
              >
                <Button
                  label="登入"
                  class="p-button-outlined p-button-sm w-full"
                />
              </NuxtLink>
              <NuxtLink
                to="/register"
                @click="toggleMobileMenu"
              >
                <Button
                  label="註冊"
                  class="p-button-primary p-button-sm w-full"
                />
              </NuxtLink>
            </template>
            <template v-else>
              <Button
                label="登出"
                class="p-button-danger p-button-sm w-full"
                @click="logout"
              />
            </template>
          </div>
          <!-- 暗黑模式切換 -->
          <div class="mt-auto">
            <Button
              @click="toggleColorMode"
              text
            >
              <Icon
                class="dark:text-gray-100"
                :name="colorModeIcon"
              />
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  </nav>
</template>

<script setup>
const {
  isAuthenticated,
  logout: authLogout,
  user,
} = {
  isAuthenticated: true,
  logout: () => {},
  user: { name: "John Doe" },
};

const mobileMenuVisible = ref(false);
const router = useRouter();

const colorMode = useColorMode();

const toggleColorMode = () => {
  const modes = ["light", "dark", "system"];
  const currentMode = colorMode.preference;
  const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];
  colorMode.preference = nextMode;
};

const colorModeIcon = computed(() => {
  switch (colorMode.preference) {
    case "light":
      return "line-md:moon-filled-to-sunny-filled-transition";
    case "dark":
      return "line-md:sunny-filled-loop-to-moon-filled-transition";
    case "system":
      return "line-md:cloud-alt-filled";
    default:
      return "line-md:cloud-alt-filled";
  }
});

// 移動設備菜單切換
const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value;
};

// 用戶菜單選項
const userMenuOptions = ref([
  { label: "我的課程", command: () => router.push("/my-lessons") },
  { label: "我的租借", command: () => router.push("/my-rentals") },
  { label: "設定", command: () => router.push("/settings") },
  {
    label: "登出",
    command: () => {
      authLogout();
      router.push("/");
    },
  },
]);

// 登出函數
const logout = () => {
  authLogout();
  router.push("/");
};
</script>

<style scoped>
/* 自定義樣式（如果需要） */
</style>
