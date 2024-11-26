export default defineEventHandler(async (event) => {
  setResponseStatus(event, 404, "Not Found");
  return {
    code: "not_found",
    msg: "Not Found",
  };
});
