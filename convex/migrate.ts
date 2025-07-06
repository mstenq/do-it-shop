import { v } from "convex/values";
import { internal } from "./_generated/api";
// don't use triggerInternalMutation here as they slow down massive processes
import { internalMutation } from "./_generated/server";

export const processFM = internalMutation({
  args: {},
  handler: async (ctx): Promise<any> => {
    // get all records from "fmEmployees" table
    const fmEmployees = await ctx.db.query("fmEmployees").collect();
    console.log("Processing FileMaker Employees:", fmEmployees.length);

    let timeout = 1000;
    for (const fmEmployee of fmEmployees) {
      if (fmEmployee.nameFirst === "" && fmEmployee.nameLast === "") {
        continue; // Skip employees with no name
      }
      const searchParts = [
        fmEmployee.nameFirst,
        fmEmployee.nameLast,
        fmEmployee.email,
      ].filter(Boolean);

      const searchIndex = searchParts.join(" ");

      const newId = await ctx.db.insert("employees", {
        nameFirst: fmEmployee.nameFirst,
        nameLast: fmEmployee.nameLast,
        phoneNumber: fmEmployee.phoneNumber,
        email: fmEmployee.email,
        filemakerId: fmEmployee.filemakerId,
        isActive: fmEmployee.isActive,
        type: fmEmployee.type,
        isDeleted: false,
        searchIndex,
        modificationTime: new Date().getTime(),
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

    const timeInserts = fmTimes.map((fmTime) =>
      ctx.db.insert("times", {
        employeeId: args.convexEmployeeId,
        startTime: fmTime.startTime,
        endTime: fmTime.endTime === 0 ? undefined : fmTime.endTime,
        totalTime: fmTime.totalTime,
        filemakerId: fmTime.filemakerId,
      })
    );

    ctx.scheduler.runAfter(10000, internal.employees.calculateHours, {
      id: args.convexEmployeeId,
    });

    await Promise.all(timeInserts);
  },
});
