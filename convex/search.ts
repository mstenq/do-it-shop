import { Infer, v } from "convex/values";
import { tableName } from "./schema";
import { authQuery } from "./utils";

type TableName = Infer<typeof tableName>;
type SearchResultItem = {
  _id: string;
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

    const paySchedules = await ctx.db
      .query("paySchedule")
      .withSearchIndex("search", (q) => q.search("searchIndex", args.q))
      .take(LIMIT);

    const searchResults: SearchResultItem[] = [
      ...(employees ?? []).map(
        (e) =>
          ({
            _id: String(e._id),
            table: "employees",
            title: `${e.nameFirst} ${e.nameLast}`,
            subtitle: e.email ?? "",
          }) satisfies SearchResultItem
      ),
      ...(paySchedules ?? []).map(
        (schedule) =>
          ({
            _id: String(schedule._id),
            table: "paySchedule",
            title: schedule.name,
            subtitle: `${schedule.startDate} - ${schedule.endDate}`,
          }) satisfies SearchResultItem
      ),
    ];

    return searchResults;
  },
});
