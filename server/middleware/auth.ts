export default defineEventHandler(async (event) => {
  event.context.currentUser = {
    id: "5d26118e-7900-4465-a496-7917a6fb5ec1",
    name: "mock-user",
    roles: ["admin"],
  };
});
