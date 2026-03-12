"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Routes } from "@/app/routes";
import EmptyContent from "../shared/empty-content";
import PropertyImage from "@/components/shared/PropertyImage";

export type NewProperty = {
  timestamp: number;
  txHash: string;
  args: {
    propertyId: bigint;
    landlord: string;
    value: bigint;
    duration: bigint;
    tokenId: bigint;
    name: string;
    image: string;
    propertyAddress: string;
    city: string;
    state: string;
    zipCode: string;
    currency: string;
  };
};

export const columns: ColumnDef<NewProperty>[] = [
  {
    id: "property",
    header: () => <p className="uppercase">PROPERTY</p>,
    cell: ({ row }) => {
      const property = row.original;
      return (
        <div className="flex items-center space-x-3">
          {/* ✅ PropertyImage handles IPFS URLs and gateway fallbacks */}
          <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0">
            <PropertyImage
              src={property.args.image}
              alt={property.args.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="text-green-500 font-medium text-lg">
              {property.args.name}
            </p>
            <p className="text-gray-700">
              {property.args.propertyAddress?.length > 20
                ? `${property.args.propertyAddress.slice(0, 20)}...`
                : property.args.propertyAddress}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "value",
    header: () => <div className="uppercase">Price</div>,
    cell: ({ row }) => {
      const property = row.original;
      return (
        <p className="text-sm">
          {property.args.currency} {Number(property.args.value)}
        </p>
      );
    },
  },
  {
    id: "monthly",
    header: () => <div className="uppercase">Monthly Rent</div>,
    cell: ({ row }) => {
      const property = row.original;
      const monthly =
        Number(property.args.duration) > 0
          ? Number(property.args.value) / Number(property.args.duration)
          : 0;
      return (
        <p className="text-sm">
          {property.args.currency} {monthly.toFixed(2)}
        </p>
      );
    },
  },
  {
    id: "tokenId",
    header: () => <div className="uppercase text-center">Token ID</div>,
    cell: ({ row }) => {
      const property = row.original;
      return (
        <p className="text-sm text-center">#{Number(property.args.tokenId)}</p>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const property = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(`${property.args.tokenId}`)
              }
            >
              Copy Token ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                target="_blank"
                href={`https://sepolia-blockscout.lisk.com/tx/${property.txHash}`}
              >
                View on Explorer
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`${Routes.LANDLORD_PROPERTIES}/${Number(
                  property.args.propertyId
                )}?tokenId=${property.args.tokenId}`}
              >
                View Property Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const DashboardPropertyTable = ({ allData }: { allData: NewProperty[] }) => {
  const [density] = useState<string>("flexible");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<NewProperty[]>(allData);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    setData(allData);
  }, [allData]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full mt-6">
      <div className="rounded-md border">
        {allData.length < 1 ? (
          <EmptyContent className="" emptyText="No properties created yet" />
        ) : (
          <Table
            className={cn({
              "[&_td]:py-px [&_th]:py-px": density === "compact",
              "[&_td]:py-1 [&_th]:py-1": density === "standard",
              "[&_td]:py-3 [&_th]:py-2 [&_th]:first:pl-5 [&_td]:first:pl-5 bg-white rounded-lg [&_th]:bg-gray-200":
                density === "flexible",
            })}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default DashboardPropertyTable;