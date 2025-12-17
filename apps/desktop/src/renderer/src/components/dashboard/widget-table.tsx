'use client'

import { useMemo, useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { TableWidgetConfig } from '@shared/index'

interface WidgetTableProps {
  config: TableWidgetConfig
  data: Record<string, unknown>[]
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }
  if (value instanceof Date) {
    return value.toLocaleString()
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  const str = String(value)
  if (str.length > 50) {
    return str.slice(0, 47) + '...'
  }
  return str
}

export function WidgetTable({ config, data }: WidgetTableProps) {
  const { maxRows, columns: configColumns, sortBy: initialSort } = config

  const [sortColumn, setSortColumn] = useState<string | null>(initialSort?.column ?? null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    initialSort?.direction ?? 'asc'
  )

  const columns = useMemo(() => {
    if (configColumns && configColumns.length > 0) {
      return configColumns
    }
    if (data.length > 0) {
      return Object.keys(data[0])
    }
    return []
  }, [configColumns, data])

  const sortedData = useMemo(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal === null || aVal === undefined) return sortDirection === 'asc' ? 1 : -1
      if (bVal === null || bVal === undefined) return sortDirection === 'asc' ? -1 : 1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      const comparison = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

  const displayData = useMemo(() => {
    return sortedData.slice(0, maxRows)
  }, [sortedData, maxRows])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-1">
                  <span className="truncate text-xs">
                    {column.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  {sortColumn === column ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="size-3 flex-shrink-0" />
                    ) : (
                      <ArrowDown className="size-3 flex-shrink-0" />
                    )
                  ) : (
                    <ArrowUpDown className="size-3 flex-shrink-0 opacity-30" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column} className="text-xs py-1.5">
                  <span
                    className={cn(
                      'block truncate max-w-[200px]',
                      row[column] === null || row[column] === undefined
                        ? 'text-muted-foreground'
                        : ''
                    )}
                    title={String(row[column] ?? '')}
                  >
                    {formatCellValue(row[column])}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length > maxRows && (
        <div className="text-xs text-muted-foreground text-center py-2 border-t">
          Showing {maxRows} of {data.length} rows
        </div>
      )}
    </div>
  )
}
