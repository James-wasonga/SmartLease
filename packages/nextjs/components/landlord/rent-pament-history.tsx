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
import { LucideExternalLink } from "lucide-react";
import { useState } from "react";

  import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRentPayments } from "@/hooks/property/usePropertyEvents";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenantPayments } from "@/hooks/property/useTenant";
import { useAccount } from "wagmi";

export type PaymentHistory = {
    date: string,
    amount: number,
    currency: string,
    txn_hash: string,
    equity_earned: number
}

export const columns: ColumnDef<PaymentHistory>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
            <p className=" uppercase">Date</p>
        );
      },
      cell: ({ row }) => <div className="text-lg">{row.getValue("date")}</div>
    },
    {
      accessorKey: "amount",
      header: () => {
        return (
            <p className=" uppercase">Amount</p>
        );
      },
      cell: ({ row }) => {
        const data = row.original
        return <div className="lowercase text-lg">{data.currency}{data.amount}</div>
      },
    },
    {
        accessorKey: "equity_earned",
        header: () => <div className="uppercase">Equity Earned</div>,
        cell: ({ row }) => {
            return (
                <div className="w-full flex text-lg text-center gap-3">{row.getValue('equity_earned')}%</div>
            )
        },
    },
    {
        accessorKey: "txn_hash",
        header: () => <div className="uppercase text-center">Tnx Hash</div>,
        cell: ({ row }) => {
            const tx: string = row.getValue('txn_hash')
            return <p className="text-center text-gray-400">{tx.slice(0, 6)}...{tx.slice(-7)}</p>
        },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
            <Link href={""}>
                <LucideExternalLink size={20} className="text-primary"/>
            </Link>
        );
      },
    },
];

const PropertyPaymentHistoryTable = () => {
    const [density, setDensity] = useState<string>("flexible");
  const [sorting, setSorting] = useState<SortingState>([]);
  const {address} = useAccount()
  const path = usePathname()
  const propertyId = path.split("/")[3]

  const {data, error, loading} = useTenantPayments(address, +propertyId)
  console.log(data)


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
            "[&_td]:py-5 [&_th]:py-4 [&_th]:first:pl-5 [&_td]:first:pl-5 bg-white rounded-lg [&_th]:bg-gray-200": density === "flexible",
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
                  No payment history for now
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default PropertyPaymentHistoryTable