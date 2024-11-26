import short from "short-uuid";
export const useUUID = () => {
  return {
    shortUUID: () => {
      return short.generate().slice(0, 8);
    },
  };
};
