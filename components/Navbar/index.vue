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
          {{ brandName }}
        </span>
      </NuxtLink>
    </div>

    <!-- 桌面導航鏈接 -->
    <div class="hidden md:flex space-x-6">
      <NuxtLink
        v-for="link in desktopNavLinks"
        :key="link.to"
        :to="link.to"
        class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
      >
        {{ link.label }}
      </NuxtLink>
    </div>

    <!-- 用戶操作區域 -->
    <div class="flex items-center space-x-4 ms-auto">
      <!-- 登入/註冊 按鈕 -->
      <template v-if="!isAuthenticated">
        <NuxtLink 
          v-for="button in authButtons" 
          :key="button.label" 
          :to="button.to"
        >
          <Button
            :label="button.label"
            :class="button.class"
          />
        </NuxtLink>
      </template>

      <!-- 用戶菜單 -->
      <template v-else>
        <SplitButton 
          :model="userMenuOptions"
          label="用戶選單"
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
          v-for="link in mobileNavLinks"
          :key="link.to"
          :to="link.to"
          class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          @click="toggleMobileMenu"
        >
          {{ link.label }}
        </NuxtLink>
        <hr class="border-gray-300 dark:border-gray-600" />
        <div class="h-full flex flex-col gap-2">
          <div>
            <template v-if="!isAuthenticated">
              <NuxtLink 
                v-for="button in authButtons" 
                :key="button.label"
                :to="button.to"
                @click="toggleMobileMenu"
              >
                <Button
                  :label="button.label"
                  :class="button.class"
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

<script setup lang="ts">
import { ref, computed } from "vue";

// 定義介面和類型
interface NavLink {
  label: string
  to: string
}

interface AuthButton {
  label: string
  to: string
  class: string
}

interface UserMenuItem {
  label: string
  command: () => void
}

// 品牌名稱
const brandName = "場地租借系統";

// 桌面導航連結
const desktopNavLinks: NavLink[] = [
  { label: "首頁", to: "/" },
  { label: "教練課程", to: "/coach-lessons" },
  { label: "場地租借", to: "/timeSlots" }
];

// 移動設備導航連結
const mobileNavLinks: NavLink[] = [...desktopNavLinks];

// 登入/註冊按鈕
const authButtons: AuthButton[] = [
  { 
    label: "登入", 
    to: "/login", 
    class: "p-button-outlined p-button-sm text-gray-700 dark:text-gray-300" 
  },
  { 
    label: "註冊", 
    to: "/register", 
    class: "p-button-primary p-button-sm" 
  }
];

// 模擬認證狀態（實際應用中從真實的認證服務獲取）
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

const colorMode = useColorMode();

// 切換顏色模式
const toggleColorMode = () => {
  const modes = ["light", "dark", "system"] as const;
  const currentMode = colorMode.preference;
  const nextMode = modes[(modes.indexOf(currentMode as any) + 1) % modes.length];
  colorMode.preference = nextMode;
};

// 根據顏色模式選擇圖標
const colorModeIcon = computed(() => {
  switch (colorMode.value) {
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

// 切換移動設備菜單
const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value;
};

// 用戶菜單選項
const userMenuOptions = ref<UserMenuItem[]>([
  { label: "我的課程", command: () => navigateTo("/user/me/lessons") },
  { label: "我的租借", command: () => navigateTo("/user/me/bookings") },
  { label: "設定", command: () => navigateTo("/settings") },
  {
    label: "登出",
    command: () => {
      authLogout();
      navigateTo("/");
    },
  },
]);

// 登出函數
const logout = () => {
  authLogout();
  navigateTo("/");
};
</script>

<style scoped>
/* 自定義樣式（如果需要） */
</style>