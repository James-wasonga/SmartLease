"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";

type TablePaginationProps = {
    total: number,
    setpage: React.Dispatch<React.SetStateAction<number>>
    currentPage: number,
    itemsPerpage: number
}

export default function TablePagination({currentPage, setpage, total, itemsPerpage}:TablePaginationProps) {
//   const [rowsPerPage, setRowsPerPage] = React.useState(10);

  return (
    <div className="w-full flex items-center justify-between gap-2">
        <div ></div>
      <div className="flex items-center gap-2">
        <span className="text-xl text-muted-foreground whitespace-nowrap">
          {(currentPage - 1) * itemsPerpage + 1}-{currentPage * itemsPerpage} of {total}
        </span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                aria-label="Go to previous page"
                size="icon"
                variant="ghost"
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-10 w-10" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                aria-label="Go to next page"
                size="icon"
                variant="ghost"
                disabled={currentPage * itemsPerpage >= total}
              >
                <ChevronRightIcon className="h-10 w-10" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
