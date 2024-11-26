<template>
  <div>
    <Navbar h-4rem />
    <div
      pt-4rem
      h-full
    >
      <Breadcrumb
        v-if="breadcrumbStore.breadcrumbs.length > 0"
        :model="breadcrumbStore.breadcrumbs"
      >
        <template #item="{ item, props }">
          <NuxtLink
            v-if="item.route"
            v-slot="{ href, navigate }"
            :to="item.route"
            custom
          >
            <a
              :href="href"
              v-bind="props.action"
              @click="navigate"
            >
              <span :class="[item.icon, 'text-color']" />
              <span class="text-primary font-semibold">{{ item.label }}</span>
            </a>
          </NuxtLink>
          <a
            v-else
            :href="item.url"
            :target="item.target"
            v-bind="props.action"
          >
            <span class="text-surface-700 dark:text-surface-0">{{
              item.label
            }}</span>
          </a>
        </template>
      </Breadcrumb>
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
const breadcrumbStore = useBreadcrumbStore();
</script>

<style></style>
