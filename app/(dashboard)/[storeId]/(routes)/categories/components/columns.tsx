"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type CategoryColumn = {
    id: string;
    name: string;
    billboardLabel: string;
    // in db, createdAt is a date but we will format it
    createdAt: string;
};

export const columns: ColumnDef<CategoryColumn>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },

    //QUESTION: NO "billboard "key???
    // The accessorKey is set to "billboard," but it seems that there is no "billboard" property in the CategoryColumn type. Instead, the cell function is using row.original.billboardLabel to retrieve the value for the cell.

    // In this case, the accessorKey seems to be a bit misleading because it doesn't directly correspond to a property in the data. The actual data is obtained using row.original.billboardLabel in the cell function. The accessorKey might be there for consistency with the library's API, but its value isn't directly used to access the data.
    {
        accessorKey: "billboard",
        header: "Billboard",
        cell: ({ row }) => row.original.billboardLabel,
    },
    {
        accessorKey: "createdAt",
        header: "Date",
    },

    {
        id: "actions",
        // this is how we access the original row
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];
