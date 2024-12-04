import { getToken } from "#auth";
export default defineEventHandler(async (event) => {
  const token = getToken({ event });
  return token;
});
