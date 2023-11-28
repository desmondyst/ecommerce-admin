"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type BillboardColumn = {
    id: string;
    label: string;
    // in db, createdAt is a date but we will format it
    createdAt: string;
};

export const columns: ColumnDef<BillboardColumn>[] = [
    // NOTE: Specifies the key (property) in the data object from which to retrieve the data for this column. In this case, it's "label."
    {
        accessorKey: "label",
        header: "Label",
    },
    {
        accessorKey: "createdAt",
        header: "Date",
    },
    // NOTE: cell formatting https://ui.shadcn.com/docs/components/data-table
    {
        id: "actions",
        // NOTE: not related to shadcnUI, but telated to the tanstack/react-table
        // this is how we access the original row
        cell: ({ row }) => <CellAction data={row.original} />,

        // header: "Date",
    },
];
