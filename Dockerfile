FROM node:20-slim as builder

WORKDIR /app

COPY .output .output
# EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]