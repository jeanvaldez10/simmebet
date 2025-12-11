"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Plus, Search, Trash2, Mail, Twitter, FileText, AlertCircle, CheckCircle, X, Search as SearchIcon } from "lucide-react"
import { toast } from "sonner"

interface WhitelistEntry {
  id: string
  email?: string
  twitterId?: string
  twitterUsername?: string
  isActive: boolean
  created_at: string
  updated_at: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface WhitelistData {
  entries: WhitelistEntry[]
  pagination: PaginationInfo
}

export function WhitelistManagement() {
  const [data, setData] = useState<WhitelistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "email" | "twitter">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({ email: "", twitterId: "", twitterUsername: "" })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [entryError, setEntryError] = useState("")
  const [lookingUpTwitter, setLookingUpTwitter] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchWhitelist = async (page = 1, search = "", type = "all") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(type !== "all" && { type })
      })

      const response = await fetch(`/api/admin/whitelist?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch whitelist entries")
      }

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching whitelist:", error)
      toast.error("Failed to fetch whitelist entries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWhitelist(currentPage, searchTerm, filterType)
  }, [currentPage, searchTerm, filterType])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (value: "all" | "email" | "twitter") => {
    setFilterType(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setCurrentPage(1)
  }

  const handleEntryChange = (field: 'email' | 'twitterId' | 'twitterUsername', value: string) => {
    setNewEntry({ ...newEntry, [field]: value })
    // Clear error when user starts typing
    if (entryError) {
      setEntryError("")
    }
  }



  const lookupTwitterUser = async (username: string) => {
    try {
      setLookingUpTwitter(true)
      setEntryError("")
      
      const cleanUsername = username.replace(/^@/, '')
      
      const response = await fetch(`/api/admin/whitelist/lookup-twitter?username=${encodeURIComponent(cleanUsername)}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to lookup Twitter user')
      }
      
      const data = await response.json()
      
      if (data.id) {
        setNewEntry({ ...newEntry, twitterId: data.id })
        toast.success(`Found Twitter ID: ${data.id}`)
      } else {
        throw new Error('Could not find Twitter ID for this username')
      }
    } catch (error) {
      console.error('Error looking up Twitter user:', error)
      setEntryError(error instanceof Error ? error.message : 'Failed to lookup Twitter user')
    } finally {
      setLookingUpTwitter(false)
    }
  }

  const handleAddEntry = async () => {
    // Clear previous errors
    setEntryError("")
    
    if (!newEntry.email && !newEntry.twitterId && !newEntry.twitterUsername) {
      setEntryError("Please provide either an email or Twitter ID/username")
      return
    }

    try {
      const response = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add entry")
      }

      toast.success("Entry added successfully")
      setNewEntry({ email: "", twitterId: "", twitterUsername: "" })
      setEntryError("")
      setIsAddDialogOpen(false)
      fetchWhitelist(currentPage, searchTerm, filterType)
    } catch (error) {
      console.error("Error adding entry:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add entry")
    }
  }

  const handleRemoveEntry = async (email?: string, twitterId?: string, twitterUsername?: string) => {
    if (!confirm("Are you sure you want to remove this entry?")) {
      return
    }

    try {
      const params = new URLSearchParams()
      if (email) params.append("email", email)
      if (twitterId) params.append("twitterId", twitterId)
      if (twitterUsername) params.append("twitterUsername", twitterUsername)

      const response = await fetch(`/api/admin/whitelist?${params}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove entry")
      }

      toast.success("Entry removed successfully")
      fetchWhitelist(currentPage, searchTerm, filterType)
    } catch (error) {
      console.error("Error removing entry:", error)
      toast.error(error instanceof Error ? error.message : "Failed to remove entry")
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error("Please select a file")
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", uploadFile)

      const response = await fetch("/api/admin/whitelist/bulk", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Upload error details:", error)
        if (error.details && Array.isArray(error.details)) {
          throw new Error(`${error.error}\n\nValidation errors:\n${error.details.join('\n')}`)
        }
        throw new Error(error.error || "Failed to upload file")
      }

      const result = await response.json()
      toast.success(result.message)
      setUploadFile(null)
      setIsUploadDialogOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      fetchWhitelist(currentPage, searchTerm, filterType)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getEntryType = (entry: WhitelistEntry) => {
    if (entry.email && entry.twitterId) return "both"
    if (entry.email) return "email"
    if (entry.twitterId) return "twitter"
    return "unknown"
  }

  const getEntryTypeIcon = (entry: WhitelistEntry) => {
    const type = getEntryType(entry)
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "both":
        return <div className="flex gap-1"><Mail className="h-3 w-3" /><Twitter className="h-3 w-3" /></div>
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getEntryTypeBadge = (entry: WhitelistEntry) => {
    const type = getEntryType(entry)
    const variants = {
      email: "default",
      twitter: "destructive",
      both: "outline",
      unknown: "secondary"
    } as const

    return (
      <Badge variant={variants[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Whitelist Management</h2>
          <p className="text-muted-foreground">
            Manage email and Twitter ID whitelist entries
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Whitelist Entry</DialogTitle>
                <DialogDescription>
                  Add a new email or Twitter ID to the whitelist
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newEntry.email}
                    onChange={(e) => handleEntryChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="twitterUsername">Twitter Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="twitterUsername"
                      type="text"
                      placeholder="@username or username"
                      value={newEntry.twitterUsername}
                      onChange={(e) => handleEntryChange('twitterUsername', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newEntry.twitterUsername && !/^\d+$/.test(newEntry.twitterUsername)) {
                          lookupTwitterUser(newEntry.twitterUsername)
                        } else {
                          setEntryError("Please enter a username to lookup (not a numeric ID)")
                        }
                      }}
                      disabled={lookingUpTwitter || !newEntry.twitterUsername || /^\d+$/.test(newEntry.twitterUsername)}
                    >
                      {lookingUpTwitter ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <SearchIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter Twitter username and click search to automatically find the ID.
                  </p>
                </div>
                <div>
                  <Label htmlFor="twitterId">Twitter ID</Label>
                  <Input
                    id="twitterId"
                    type="text"
                    placeholder="123456789"
                    value={newEntry.twitterId}
                    onChange={(e) => handleEntryChange('twitterId', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the numeric Twitter ID if you have it. Both username and ID can be provided.
                  </p>
                </div>
                {entryError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-800 dark:text-red-200">
                      {entryError}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    At least one field (email, Twitter ID, or Twitter username) must be provided.
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false)
                    setEntryError("")
                    setNewEntry({ email: "", twitterId: "", twitterUsername: "" })
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry}>
                    Add Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Upload Whitelist</DialogTitle>
                <DialogDescription>
                  Upload a CSV or text file with email addresses and Twitter IDs
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800 dark:text-blue-200">Supported formats:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <li>CSV: email,twitterId or email,username</li>
                      <li>Text: One email, Twitter ID, or username per line</li>
                      <li>Comments starting with # are ignored</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleFileUpload} disabled={uploading || !uploadFile}>
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by email or Twitter ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="filter">Filter by Type</Label>
              <Select value={filterType} onValueChange={handleFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="twitter">Twitter Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || filterType !== "all") && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Whitelist Entries</CardTitle>
          <CardDescription>
            {data ? `${data.pagination.total} total entries` : "Loading..."}
            {filterType !== "all" && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                (Filtered by {filterType === "email" ? "Email" : "Twitter"})
              </span>
            )}
            {searchTerm && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                (Search: &quot;{searchTerm}&quot;)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : data && data.entries.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Twitter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEntryTypeIcon(entry)}
                          {getEntryTypeBadge(entry)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-green-500" />
                            <span className="font-mono text-sm bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                              {entry.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.twitterId || entry.twitterUsername ? (
                          <div className="flex items-center gap-2">
                            <Twitter className="h-4 w-4 text-blue-500" />
                            <div className="flex flex-col gap-1">
                              {entry.twitterUsername && (
                                <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">
                                  @{entry.twitterUsername.replace(/^@/, '')}
                                </span>
                              )}
                              {entry.twitterId && (
                                <span className="text-xs text-muted-foreground">
                                  ID: {entry.twitterId}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.isActive ? "default" : "destructive"}>
                          {entry.isActive ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <X className="h-3 w-3" />
                              Inactive
                            </div>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEntry(entry.email, entry.twitterId, entry.twitterUsername)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{" "}
                    {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
                    {data.pagination.total} entries
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!data.pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!data.pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No whitelist entries found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
