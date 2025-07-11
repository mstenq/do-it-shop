import { Infer, v } from "convex/values";
import { groups, tableName } from "./schema";
import { authQuery, joinData, NullP } from "./utils";
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

    const customers = await ctx.db
      .query("customers")
      .withSearchIndex("search", (q) =>
        q.search("searchIndex", args.q).eq("isDeleted", false)
      )
      .take(LIMIT);

    const jobs = await ctx.db
      .query("jobs")
      .withSearchIndex("search", (q) =>
        q.search("searchIndex", args.q).eq("isDeleted", false)
      )
      .take(LIMIT);

    // Join related data for jobs
    const joinedJobs = await joinData(jobs, {
      customer: (j) => (j.customerId ? ctx.db.get(j.customerId) : NullP),
      employee: (j) => (j.employeeId ? ctx.db.get(j.employeeId) : NullP),
    });

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
      ...(customers ?? []).map(
        (customer) =>
          ({
            _id: String(customer._id),
            table: "customers",
            title: customer.name,
            subtitle: customer.address?.city
              ? `${customer.address.city}${customer.address.state ? `, ${customer.address.state}` : ""}`
              : "",
          }) satisfies SearchResultItem
      ),
      ...(joinedJobs ?? []).map(
        (job) =>
          ({
            _id: String(job._id),
            table: "jobs",
            title: job.description,
            subtitle: job.customer?.name
              ? `${job.customer.name} - ${job.status}`
              : job.status,
          }) satisfies SearchResultItem
      ),
    ];

    return searchResults;
  },
});

export const customers = authQuery({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    console.log("Customer search query:", args.q);

    const customers = await ctx.db
      .query("customers")
      .withSearchIndex("searchCustomerName", (q) =>
        q.search("name", args.q).eq("isDeleted", false)
      )
      .take(10);

    return customers.map((c) => ({
      _id: String(c._id),
      name: c.name,
    }));
  },
});

export const valueList = authQuery({
  args: { q: v.string(), group: groups },
  handler: async (ctx, args) => {
    console.log("ValueList search query:", args);

    const options = await ctx.db
      .query("valueLists")
      .withSearchIndex("search", (q) =>
        q.search("value", args.q).eq("group", args.group)
      )
      .take(10);

    return options.map((c) => ({
      _id: String(c._id),
      value: c.value,
    }));
  },
});
