import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const processFM = internalMutation({
  args: {},
  handler: async (ctx): Promise<any> => {
    // get all records from "fmEmployees" table
    const fmEmployees = await ctx.db.query("fmEmployees").collect();
    console.log("Processing FileMaker Employees:", fmEmployees.length);

    let timeout = 1000;
    for (const fmEmployee of fmEmployees) {
      const newId = await ctx.db.insert("employees", {
        nameFirst: fmEmployee.nameFirst,
        nameLast: fmEmployee.nameLast,
        phoneNumber: fmEmployee.phoneNumber,
        email: fmEmployee.email,
        filemakerId: fmEmployee.filemakerId,
        isActive: fmEmployee.isActive,
        type: fmEmployee.type,
      });

      await ctx.scheduler.runAfter(
        timeout,
        internal.migrate.processEmployeeTimes,
        {
          employeeFilemakerId: fmEmployee.filemakerId,
          convexEmployeeId: newId,
        }
      );
      timeout += 1000; // Increment timeout to avoid rate limiting
    }
  },
});

export const processEmployeeTimes = internalMutation({
  args: {
    employeeFilemakerId: v.string(),
    convexEmployeeId: v.id("employees"),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get all times in system
    const fmTimes = await ctx.db
      .query("fmTimes")
      .withIndex("by_employeeFilemakerId", (q) =>
        q.eq("employeeFilemakerId", args.employeeFilemakerId)
      )
      .collect();

    console.log("Processing FileMaker Times:", fmTimes.length);
    for (const fmTime of fmTimes) {
      await ctx.db.insert("times", {
        employeeId: args.convexEmployeeId,
        date: fmTime.date,
        startTime: String(fmTime.startTime),
        endTime: fmTime.endTime === ":00" ? undefined : String(fmTime.endTime),
        totalTime: fmTime.totalTime,
        filemakerId: fmTime.filemakerId,
      });
    }
  },
});
