import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) {
    event.context.currentUser = null;
  } else {
    event.context.currentUser = {
      id: session.user.id,
      name: session.user.name || "",
      roles: session.user.roles,
    };
  }
});
