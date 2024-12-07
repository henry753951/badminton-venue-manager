<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
  <ConfirmPopup />
</template>

<style>
body {
  background-color: #fafafa;
}

*{
  transition: background-color 0.2s;
}

html.dark body {
  background-color: unset;
}
</style>
