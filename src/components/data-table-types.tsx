import "@tanstack/react-table";
import "@tanstack/table-core";
import { FilterFn, RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "right" | "left" | "center";
    alwaysVisible?: boolean;
  }

  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
}
