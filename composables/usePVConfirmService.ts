import { useConfirm } from "primevue/useconfirm";

export const usePVConfirmService = () => {
  const nuxtApp = useNuxtApp();
  const getConfirm: typeof useConfirm = () => nuxtApp.vueApp.config.globalProperties.$confirm;
  const confirmService = getConfirm();
  return confirmService;
};
