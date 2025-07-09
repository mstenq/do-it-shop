import { Infer, v } from "convex/values";
import { tableName } from "./schema";
import { authQuery } from "./utils";
import dayjs from "dayjs";
import WeekOfYear from "dayjs/plugin/weekOfYear";
import Timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(Timezone);
dayjs.extend(WeekOfYear);
dayjs.extend(Duration);

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
            subtitle: `${dayjs.tz(schedule.startDate, "America/Denver").format("M/D/YYYY")} - ${dayjs.tz(schedule.endDate, "America/Denver").format("M/D/YYYY")}`,
          }) satisfies SearchResultItem
      ),
    ];

    return searchResults;
  },
});
