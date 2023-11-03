import fs from "fs";
import { cwd } from "process";

function main() {
  const journalFile = fs.readFileSync(
    "public/migrations/meta/_journal.json",
    "utf-8",
  );
  const journal = JSON.parse(journalFile);
  const lastEntry = journal.entries[journal.entries.length - 1].tag;

  const migrationFile = fs.readFileSync(
    `public/migrations/${lastEntry}.sql`,
    "utf-8",
  );

  // use regex to get between "CREATE TABLE `" and "` ("
  const tableName = migrationFile.match(/(?<=CREATE TABLE `)[^`]*/)[0];
  if (!tableName) {
    console.log("No table name found, skipping...");
    return;
  }

  // make sure there is a updated_at column being added
  const hasUpdatedAt = migrationFile.match(/(?<=`updated_at`)/);
  if (!hasUpdatedAt) {
    console.log("No updated_at column found, skipping...");
    return;
  }

  // see if "UPDATE_<<TABLE_NAME>>_TS"  already exists
  const hasTrigger = migrationFile.match(
    new RegExp(`UPDATE_${tableName.toUpperCase()}_TS`),
  );
  if (hasTrigger) {
    console.log("Trigger already exists, skipping...");
    return;
  }

  // get trigger template
  const triggerTemplate = fs.readFileSync(
    `.scripts/sql-templates/updated_at_trigger.sql`,
    "utf-8",
  );
  if (!triggerTemplate) {
    throw new Error("Error: No trigger template found");
  }

  // create trigger template
  let newTrigger = triggerTemplate.replace(/<<table_name>>/g, tableName);
  newTrigger = newTrigger.replace(/<<TABLE_NAME>>/g, tableName.toUpperCase());

  // append to migration file
  const newMigrationFile = migrationFile + newTrigger;
  fs.writeFileSync(
    `public/migrations/${lastEntry}.sql`,
    newMigrationFile,
    "utf-8",
  );

  console.log(
    "Added [UPDATE_" + tableName.toUpperCase() + "_TS] trigger to " + tableName,
  );
}

main();
