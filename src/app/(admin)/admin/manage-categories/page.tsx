"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Plus, Edit, Trash2, MoreHorizontal, Eye, EyeOff, Tags, Activity, Search, X } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminCategoryService, AdminCategory, CreateCategoryData } from "@/services/adminCategoryService"


// Popular Lucide React icons for categories
const iconOptions = [
  "TrendingUp", "DollarSign", "Bitcoin", "Ethereum", "Coins", "Wallet", "PiggyBank",
  "BarChart3", "LineChart", "PieChart", "Activity", "Target", "Zap", "Star",
  "Heart", "ThumbsUp", "Award", "Trophy", "Crown", "Gem", "Diamond",
  "Globe", "Map", "Compass", "Navigation", "Plane", "Car", "Train",
  "Home", "Building", "Factory", "Store", "ShoppingCart", "Package",
  "Users", "User", "UserPlus", "UserCheck", "Team", "Group",
  "Calendar", "Clock", "Timer", "Stopwatch", "AlarmClock",
  "Mail", "MessageCircle", "Phone", "Video", "Camera", "Mic",
  "Music", "Play", "Pause", "Volume2", "Headphones",
  "Book", "BookOpen", "GraduationCap", "School", "Laptop", "Monitor",
  "Smartphone", "Tablet", "Gamepad2", "Controller", "Dice1",
  "Shield", "Lock", "Key", "Fingerprint", "Eye", "EyeOff",
  "Settings", "Cog", "Wrench", "Tool", "Hammer", "Screwdriver",
  "Lightbulb", "Sun", "Moon", "Cloud", "CloudRain", "Snowflake",
  "Flame", "Droplets", "TreePine", "Leaf", "Flower", "Seedling",
  "Pizza", "Coffee", "Utensils", "Wine", "Beer", "Cake",
  "Gamepad", "Dice6", "Puzzle", "Chess", "Cards", "Dice1",
  "Tags", "Tag", "Bookmark", "Flag", "Pin", "MapPin",
  "Search", "Filter", "SortAsc", "SortDesc", "List", "Grid",
  "Plus", "Minus", "X", "Check", "AlertCircle", "Info",
  "HelpCircle", "QuestionMark", "ExclamationTriangle", "AlertTriangle"
]

export default function CategoryManagement() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
    icon: "",
    isActive: true,
  })
  
  // Icon search states
  const [iconSearchQuery, setIconSearchQuery] = useState("")
  const [isIconSearchOpen, setIsIconSearchOpen] = useState(false)
  const iconSearchRef = useRef<HTMLDivElement>(null)

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const categoriesData = await AdminCategoryService.getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error(error instanceof Error ? error.message : "Failed to load categories")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Handle click outside to close icon search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconSearchRef.current && !iconSearchRef.current.contains(event.target as Node)) {
        setIsIconSearchOpen(false)
      }
    }

    if (isIconSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isIconSearchOpen])

  const handleCreateCategory = async () => {
    setIsSubmitting(true)
    try {
      const newCategory = await AdminCategoryService.createCategory(formData)
      setCategories([newCategory, ...categories])
      setIsCreateDialogOpen(false)
      setFormData({
        name: "",
        description: "",
        icon: "",
        isActive: true,
      })
      toast.success("Category created successfully")
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory) return
    
    setIsSubmitting(true)
    try {
      const updatedCategory = await AdminCategoryService.updateCategory(editingCategory.id, formData)
      setCategories(categories.map(cat => cat.id === editingCategory.id ? updatedCategory : cat))
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      setFormData({
        name: "",
        description: "",
        icon: "",
        isActive: true,
      })
      toast.success("Category updated successfully")
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      isActive: category.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return
    }

    try {
      await AdminCategoryService.deleteCategory(id)
      setCategories(categories.filter(category => category.id !== id))
      toast.success("Category deleted successfully")
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(error instanceof Error ? error.message : "Failed to delete category")
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const updatedCategory = await AdminCategoryService.updateCategory(id, { isActive: !currentStatus })
      setCategories(categories.map(cat => cat.id === id ? updatedCategory : cat))
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error updating category status:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update category status")
    }
  }

  // Filter icons based on search query
  const filteredIcons = iconOptions.filter(iconName =>
    iconName.toLowerCase().includes(iconSearchQuery.toLowerCase())
  )

  // Get icon component dynamically
  const getIconComponent = (iconName: string) => {
    try {
      // Import the icon dynamically from lucide-react
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const iconModule = require(`lucide-react`)
      return iconModule[iconName]
    } catch {
      return null
    }
  }

  // Handle icon selection
  const handleIconSelect = (iconName: string) => {
    setFormData({ ...formData, icon: iconName })
    setIsIconSearchOpen(false)
    setIconSearchQuery("")
  }

  // Clear selected icon
  const clearIcon = () => {
    setFormData({ ...formData, icon: "" })
  }

  const columns: ColumnDef<AdminCategory>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const category = row.original
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{category.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string
        return (
          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
            {description || "No description"}
          </div>
        )
      },
    },
    {
      accessorKey: "_count.marketAssignments",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Markets
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.original._count?.marketAssignments || 0
        return <div className="text-center">{count}</div>
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return <div className="text-sm">{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleStatus(category.id, category.isActive)}>
                {category.isActive ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(category.id, category.name)}
                className="text-red-600"
                disabled={!!(category._count?.marketAssignments && category._count.marketAssignments > 0)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: categories,
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
  })

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading categories...</span>
        </div>
      </div>
    )
  }

  const activeCategories = categories.filter(category => category.isActive).length
  const inactiveCategories = categories.filter(category => !category.isActive).length

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">
            Create and manage market categories for better organization
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your markets better.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Category name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="icon" className="text-right pt-2">
                  Icon
                </Label>
                <div className="col-span-3 space-y-2">
                  {formData.icon && (
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      {(() => {
                        const IconComponent = getIconComponent(formData.icon)
                        return IconComponent ? (
                          <IconComponent className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 bg-gray-200 rounded" />
                        )
                      })()}
                      <span className="text-sm font-medium">{formData.icon}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearIcon}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="relative" ref={iconSearchRef}>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search for an icon..."
                        value={iconSearchQuery}
                        onChange={(e) => setIconSearchQuery(e.target.value)}
                        onFocus={() => setIsIconSearchOpen(true)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsIconSearchOpen(!isIconSearchOpen)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {isIconSearchOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <div className="grid grid-cols-6 gap-2">
                            {filteredIcons.slice(0, 48).map((iconName) => {
                              const IconComponent = getIconComponent(iconName)
                              return (
                                <button
                                  key={iconName}
                                  type="button"
                                  onClick={() => handleIconSelect(iconName)}
                                  className="flex flex-col items-center gap-1 p-2 hover:bg-muted rounded-md transition-colors"
                                  title={iconName}
                                >
                                  {IconComponent ? (
                                    <IconComponent className="h-5 w-5" />
                                  ) : (
                                    <div className="h-5 w-5 bg-muted rounded" />
                                  )}
                                  <span className="text-xs text-center truncate w-full text-foreground">
                                    {iconName}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                          {filteredIcons.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                              No icons found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateCategory}
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              All categories created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCategories}</div>
            <p className="text-xs text-muted-foreground">
              {inactiveCategories} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Markets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((total, cat) => total + (cat._count?.marketAssignments || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage your market categories here. You can create, edit, activate/deactivate, and delete categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="flex items-center py-4">
              <Input
                placeholder="Filter categories..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="rounded-md border">
              <Table>
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
                        )
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
                        No categories found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="Category name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-icon" className="text-right pt-2">
                Icon
              </Label>
              <div className="col-span-3 space-y-2">
                {formData.icon && (
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    {(() => {
                      const IconComponent = getIconComponent(formData.icon)
                      return IconComponent ? (
                        <IconComponent className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                      )
                    })()}
                    <span className="text-sm font-medium">{formData.icon}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearIcon}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="relative" ref={iconSearchRef}>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for an icon..."
                      value={iconSearchQuery}
                      onChange={(e) => setIconSearchQuery(e.target.value)}
                      onFocus={() => setIsIconSearchOpen(true)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsIconSearchOpen(!isIconSearchOpen)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {isIconSearchOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <div className="grid grid-cols-6 gap-2">
                          {filteredIcons.slice(0, 48).map((iconName) => {
                            const IconComponent = getIconComponent(iconName)
                            return (
                              <button
                                key={iconName}
                                type="button"
                                onClick={() => handleIconSelect(iconName)}
                                className="flex flex-col items-center gap-1 p-2 hover:bg-muted rounded-md transition-colors"
                                title={iconName}
                              >
                                {IconComponent ? (
                                  <IconComponent className="h-5 w-5" />
                                ) : (
                                  <div className="h-5 w-5 bg-muted rounded" />
                                )}
                                <span className="text-xs text-center truncate w-full text-foreground">
                                  {iconName}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        {filteredIcons.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground">
                            No icons found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-active" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Checkbox
                  id="edit-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                />
                <Label htmlFor="edit-active" className="ml-2">
                  Active
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingCategory(null)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditCategory}
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
