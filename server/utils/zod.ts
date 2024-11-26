import { z } from "zod";

export const useZod = (schema: z.ZodObject<any>) => {
  return {
    /**
     * 將 Zod schema 轉換為 OpenAPI parameters 格式
     */
    toQueryParameters() {
      return Object.entries(schema.shape).map(([key, value]) => {
        // @ts-expect-error it's expected
        const isRequired = schema._def.shape[key]?._def?.required || false;
        // @ts-expect-error it's expected
        const description = value.description || "No description provided";

        return {
          in: "query" as "query" | "header" | "path" | "cookie",
          name: key,
          description: description,
          required: isRequired,
          schema: {
            // @ts-expect-error it's expected
            type: ((value?._def?.typeName || "string") as string)
              .toLowerCase()
              .replace("zod", "") as any,
          },
        };
      });
    },

    /**
     * 將 Zod schema 轉換為 OpenAPI requestBody 格式
     */
    toRequestBody() {
      const properties = Object.entries(schema.shape).reduce(
        (acc, [key, value]) => {
          acc[key] = {
            // @ts-expect-error it's expected
            type: ((value?._def?.typeName || "string") as string)
              .toLowerCase()
              .replace("zod", "") as any,
            // @ts-expect-error it's expected
            description: value.description || "No description provided",
          };
          return acc;
        },
        {} as Record<string, any>
      );

      const required = Object.keys(schema.shape).filter(
        // @ts-expect-error it's expected
        (key) => schema._def.shape[key]?._def?.required
      );

      return {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties,
              required,
            },
          },
        },
      };
    },

    /**
     * 將 Zod schema 轉換為 OpenAPI responses 格式
     */
    toResponses(description: string) {
      const properties = Object.entries(schema.shape).reduce(
        (acc, [key, value]) => {
          acc[key] = {
            // @ts-expect-error it's expected
            type: ((value?._def?.typeName || "string") as string)
              .toLowerCase()
              .replace("zod", "") as any,
            // @ts-expect-error it's expected
            description: value.description || "No description provided",
          };
          return acc;
        },
        {} as Record<string, any>
      );

      return {
        description,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties,
            },
          },
        },
      };
    },
  };
};
