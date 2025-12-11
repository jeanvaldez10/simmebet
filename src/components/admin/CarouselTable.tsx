"use client"

import { Edit, Trash2, MoreHorizontal, Eye, GripVertical, Play } from "lucide-react"
import Image from "next/image"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CarouselBannerItem } from "@/data/carouselData"

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
function DraggableRow({ item, onEdit, onDelete, onToggleActive }: {
  item: CarouselBannerItem
  onEdit: (item: CarouselBannerItem) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: item.id,
  })

  return (
    <TableRow
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      data-dragging={isDragging}
    >
      <TableCell>
        <DragHandle id={item.id} />
      </TableCell>
      <TableCell>
        <div className="relative w-24 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center border">
          {item.isVideo ? (
            <>
              <video 
                src={item.imageSrc} 
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
                onError={(e) => {
                  // Hide video on error and show fallback
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <Play className="h-4 w-4 text-white" fill="white" />
              </div>
            </>
          ) : (
            <Image
              src={item.imageSrc}
              alt={item.title || "Carousel item"}
              fill
              className="object-cover"
              sizes="96px"
              onError={(e) => {
                // Show fallback on error
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          {/* Fallback content when image/video fails to load */}
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
            {item.isVideo ? "Video" : "Image"}
          </div>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {item.title || "No title"}
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {item.description || "No description"}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {item.isVideo ? "Video" : "Image"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {item.alignment}
        </Badge>
      </TableCell>
      <TableCell>
        {item.betChance ? (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {item.betChance}%
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {item.status || 'DRAFT'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-[160px] bg-popover text-popover-foreground border-border"
          >
            <DropdownMenuItem 
              onClick={() => onEdit(item)}
              className="hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onToggleActive(item.id, item.status !== 'PUBLISHED')}
              className="hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              <Eye className="mr-2 h-4 w-4" />
              {item.status === 'PUBLISHED' ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              variant="destructive"
              onClick={() => onDelete(item.id)}
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

interface CarouselTableProps {
  items: CarouselBannerItem[]
  onEdit: (item: CarouselBannerItem) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onReorder: (items: CarouselBannerItem[]) => void
}

export function CarouselTable({ 
  items, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onReorder 
}: CarouselTableProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = items.map(({ id }) => id)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id as string)
      const newIndex = dataIds.indexOf(over.id as string)
      const newItems = arrayMove(items, oldIndex, newIndex)
      onReorder(newItems)
      toast.success("Carousel order updated")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carousel Items</CardTitle>
        <CardDescription>
          Manage your homepage carousel items. Drag to reorder.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-32">Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Alignment</TableHead>
                  <TableHead>Bet Chance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((item) => (
                      <DraggableRow
                        key={item.id}
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleActive={onToggleActive}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No carousel items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </CardContent>
    </Card>
  )
}
