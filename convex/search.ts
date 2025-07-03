import { v } from "convex/values";
import { authQuery, formatDate, formatTime, joinData, NullP } from "./utils";
import { tableName } from "./schema";
import { Infer } from "convex/values";

type TableName = Infer<typeof tableName>;
type SearchResultItem = {
  _id: string;
  id: string;
  table: TableName;
  title: string;
  subtitle: string;
};

const LIMIT = 5;

export const all = authQuery({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    console.log("Search query:", args.q);

    const employees = await ctx.db
      .query("employees")
      .withSearchIndex("search", (q) =>
        q.search("searchIndex", args.q).eq("isDeleted", false)
      )
      .take(LIMIT);

    const searchResults: SearchResultItem[] = [
      ...(employees ?? []).map(
        (e) =>
          ({
            _id: String(e._id),
            id: e.id,
            table: "employees",
            title: `${e.nameFirst} ${e.nameLast}`,
            subtitle: e.email ?? "",
          }) satisfies SearchResultItem
      ),
    ];

    return searchResults;
  },
});
