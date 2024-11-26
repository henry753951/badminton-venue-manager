import "h3"; // 確保擴充的模組被正確導入

declare module "h3" {
  interface H3EventContext {
    currentUser: {
      id: string;
      name: string;
    };
  }
}
