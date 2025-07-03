import { authMutation } from "./utils";

export const generateUploadUrl = authMutation({
  handler: async (ctx, _args) => {
    return await ctx.storage.generateUploadUrl();
  },
});
