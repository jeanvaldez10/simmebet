"use client"

import { Edit, Trash2, MoreHorizontal, Eye, GripVertical, EyeOff } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminMarket } from "@/services/adminMarketService"

// Drag handle component
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Draggable row component
function DraggableRow({ 
  market, 
  onEdit, 
  onDelete, 
  onUpdateStatus 
}: {
  market: AdminMarket
  onEdit: (market: AdminMarket) => void
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, status: AdminMarket["status"]) => void
}) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: market.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusOptions = [
      { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      { value: "RESOLVED", label: "Resolved", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
    ]
    const statusConfig = statusOptions.find(s => s.value === status)
    return statusConfig?.color || "bg-gray-100 text-gray-800"
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-50" : ""}`}
    >
      <TableCell className="w-12">
        <DragHandle id={market.id} />
      </TableCell>
      <TableCell className="min-w-[200px] max-w-[300px]">
        <div className="space-y-1">
          <p className="font-medium leading-none truncate">{market.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {market.question}
          </p>
          <p className="text-xs text-muted-foreground">
            Created by {market.creatorName}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={getStatusBadge(market.status)}>
          {market.status === "ACTIVE" ? "Active" : "Resolved"}
        </Badge>
      </TableCell>
      <TableCell>
        {market.categories && market.categories.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {market.categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {category.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No categories</span>
        )}
      </TableCell>
      <TableCell className="min-w-[100px]">
        {market.date ? new Date(market.date).toLocaleString() : "No end date"}
      </TableCell>
      <TableCell className="min-w-[80px] text-right">
        {formatCurrency(market.volume)}
      </TableCell>
      <TableCell className="min-w-[80px] text-right">
        {formatCurrency(market.totalLiquidity)}
      </TableCell>
      <TableCell className="min-w-[100px]">
        {new Date(market.updatedAt).toLocaleString()}
      </TableCell>
      <TableCell className="min-w-[60px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-[160px] bg-popover text-popover-foreground border-border"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => onEdit(market)}
              className="hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {market.status === "ACTIVE" ? (
              <DropdownMenuItem 
                onClick={() => onUpdateStatus(market.id, "RESOLVED")}
                className="hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Resolve
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => onUpdateStatus(market.id, "ACTIVE")}
                className="hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
              >
                <Eye className="mr-2 h-4 w-4" />
                Reactivate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(market.id)}
              className="hover:bg-red-900/20 hover:text-red-400 focus:bg-red-900/20 focus:text-red-400 dark:hover:bg-red-800/30 dark:focus:bg-red-800/30"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

interface MarketTableProps {
  markets: AdminMarket[]
  onEdit: (market: AdminMarket) => void
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, status: AdminMarket["status"]) => void
  onReorder: (markets: AdminMarket[]) => void
}

export function MarketTable({ 
  markets, 
  onEdit, 
  onDelete, 
  onUpdateStatus, 
  onReorder 
}: MarketTableProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = markets.map(({ id }) => id)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id as string)
      const newIndex = dataIds.indexOf(over.id as string)
      const newMarkets = arrayMove(markets, oldIndex, newIndex)
      onReorder(newMarkets)
      toast.success("Market order updated")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Markets</CardTitle>
        <CardDescription>
          Manage your prediction markets. Drag to reorder.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>End Date & Time</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Liquidity</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {markets.map((market) => (
                    <DraggableRow
                      key={market.id}
                      market={market}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onUpdateStatus={onUpdateStatus}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </div>
        </DndContext>
      </CardContent>
    </Card>
  )
}
