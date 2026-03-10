'use client'

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
  import { ArrowUpDown, MoreHorizontal, Rows2, Rows3, Rows4 } from "lucide-react";
  import * as React from "react";
import { useState } from "react";
  import { Button } from "@/components/ui/button";
  import { Progress } from "../ui/progress";
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
import { Avatar, AvatarImage } from "../ui/avatar";

const data: Tenant[] = [
    {
        equity: 23,
        property: {
            price: "13,000",
            currency: "$",
            imgUrl:"/thumbnail.jpg",
            name: "Oak Residence"
        },
        tenant: "0X1617BE12908494",
        token: 234,
        tokenId: 1234,
        tokenUri: 'https://google.com',
        tenant_contact: "susan@gmail.com"
    },
    {
        equity: 30,
        property: {
            price: "13,000",
            currency: "$",
            imgUrl:"/thumbnail.jpg",
            name: "Wall street"
        },
        tenant: "0X1617BE12908494",
        token: 23,
        tokenId: 124,
        tokenUri: 'https://google.com',
        tenant_contact: "susan@gmail.com"
    },
    {
        equity: 60,
        property: {
            price: "13,000",
            currency: "$",
            imgUrl:"/thumbnail.jpg",
            name: "Maple townhall"
        },
        tenant: "0X1617BE12908494",
        token: 23,
        tokenId: 124,
        tokenUri: 'https://google.com',
        tenant_contact: "susan@gmail.com"
    },
]

export type Tenant = {
    property:  {
        name: string,
        price: string,
        imgUrl: string,
        currency: string
    },
    tenant: string,
    tenant_contact: string,
    token: number,
    equity: number,
    tokenId: number,
    tokenUri: string
}

export const columns: ColumnDef<Tenant>[] = [
    {
      accessorKey: "tenant",
      header: () => {
        return (
            <p className=" uppercase">Tenant</p>
        );
      },
      cell: ({ row }) => {
        return (
            <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-2">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>
                    </Avatar>
                </div>
                
                <div className="lowercase">{row.getValue("tenant")}</div>
            </div>
        )
      }
    },
    {
        accessorKey: "property",
        header: ({ column }) => {
          return (
              <p className=" uppercase">PROPERTY</p>
          );
        },
        cell: ({ row }) => {
          const property = row.original
          const img = property.property.imgUrl
          return (<div className="flex items-center space-x-1">
              <div className="flex flex-col gap-y-1">
                  <p className="text-green-500 font-medium text-lg">{property.property.name}</p>
                  <p className="text-gray-700 font-medium">{property.property.currency}{property.property.price}/month</p>
              </div>
          </div>)
        },
    },
    {
      accessorKey: "token",
      header: () => <div className="uppercase">Token</div>,
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('token')}</div>;
      },
    },
    {
        accessorKey: "equity",
        header: () => <div className="uppercase">Equity</div>,
        cell: ({ row }) => {
            return (
                <div className="w-full flex items-center justify-center gap-3">
                    <Progress value={row.getValue('equity')} className="w-[60%] [&>div]:bg-green-500" />
                    <span className="text-sm">{row.getValue('equity')}%</span>
                </div>
            )
        },
    },
    {
        accessorKey: "tokenId",
        header: () => <div className="uppercase text-center">Token ID</div>,
        cell: ({ row }) => {
            return <p className="text-sm text-center">#{row.getValue('tokenId')}</p>
        },
    },
    {
        accessorKey: "tenant_contact",
        header: () => <div className="uppercase text-center">Contact</div>,
        cell: ({ row }) => {
            return <p className="text-sm text-center font-medium">{row.getValue('tenant_contact')}</p>
        },
    },
    // {
    //   id: "actions",
    //   enableHiding: false,
    //   cell: ({ row }) => {
    //     const property = row.original;
    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">Open menu</span>
    //             <MoreHorizontal />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem
    //             onClick={() => navigator.clipboard.writeText(`${property.tokenUri}`)}
    //           >
    //             Copy Token ID
    //           </DropdownMenuItem>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem>View on Explorer</DropdownMenuItem>
    //           <DropdownMenuItem>View Property details</DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
];


const TenantTable = () => {
    const [density, setDensity] = useState<string>("flexible");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
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
        <Table
          className={cn({
            "[&_td]:py-px [&_th]:py-px": density === "compact",
            "[&_td]:py-1 [&_th]:py-1": density === "standard",
            "[&_td]:py-3 [&_th]:py-2 [&_th]:first:pl-5 [&_td]:first:pl-5 bg-white rounded-lg [&_th]:bg-gray-200": density === "flexible",
          })}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
      </div>
    </div>
  );
}

export default TenantTable