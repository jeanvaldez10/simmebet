"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Upload, X } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CarouselBannerItem } from "@/data/carouselData"
import BannerCarousel from "@/components/BannerCarousel"
import { uploadAdminFile } from "@/utils/blob"
import { useAdminAuth } from "@/app/(admin)/context/AdminAuthContext"


interface CarouselFormData extends Omit<CarouselBannerItem, 'id'> {
  id?: string
  createdAt?: string
  updatedAt?: string
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  mobileBannerSrc?: string
}

export default function CreateCarouselPage() {
  const router = useRouter()
  const { adminFetch } = useAdminAuth()
  const searchParams = useSearchParams()
  const itemId = searchParams.get("id")
  const isEditing = !!itemId

  const [formData, setFormData] = useState<CarouselFormData>({
    title: "",
    subtitle: "",
    date: "",
    betChance: undefined,
    description: "",
    imageSrc: "",
    marketId: "",
    useSocialImage: false,
    mobileBannerSrc: "",
    alignment: "left",
    isVideo: false,
    primaryButtonText: "",
    primaryButtonLink: "",
    secondaryButtonText: "",
    secondaryButtonLink: "",
    status: "DRAFT"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEditing)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedMobileFile, setUploadedMobileFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [useFileUpload, setUseFileUpload] = useState(true)
  const [useMobileFileUpload, setUseMobileFileUpload] = useState(true)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileFileInputRef = useRef<HTMLInputElement>(null)
  const [markets, setMarkets] = useState<Array<{ id: string; question: string; contractAddress: string }>>([])
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false)
  const [marketSearchQuery, setMarketSearchQuery] = useState("")

  const fillTestData = () => {
    setFormData({
      title: "",
      subtitle: "",
      date: "",
      betChance: 72,
      description: "",
      imageSrc: "/banners/rajabanner.png",
      marketId: "",
      useSocialImage: false,
      alignment: "left",
      isVideo: false,
      primaryButtonText: "Sep 1st 2028 00:00am UTC",
      primaryButtonLink: "#",
      secondaryButtonText: "Place your bet",
      secondaryButtonLink: "#"
    })
    setUseFileUpload(true)
    setUploadedFile(null)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is image or video
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file')
      return
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    // Clean up previous object URL to prevent memory leaks
    if (formData.imageSrc && formData.imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageSrc)
    }

    setUploadedFile(file)
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setFormData(prev => ({ ...prev, imageSrc: previewUrl }))
  }

  const handleMobileFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is image or video
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file for mobile banner')
      return
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    // Clean up previous object URL to prevent memory leaks
    if (formData.mobileBannerSrc && formData.mobileBannerSrc.startsWith('blob:')) {
      URL.revokeObjectURL(formData.mobileBannerSrc)
    }

    setUploadedMobileFile(file)
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setFormData(prev => ({ ...prev, mobileBannerSrc: previewUrl }))
  }

  const handleFileUpload = async () => {
    if (!uploadedFile) return null

    setIsUploading(true)
    try {
      const fileExtension = uploadedFile.name.split('.').pop()
      const fileName = `carousel-${Date.now()}.${fileExtension}`
      
      const blob = await uploadAdminFile(fileName, uploadedFile)
      
      toast.success('File uploaded successfully!')
      return blob.url
    } catch (error) {
      console.error('File upload error:', error)
      toast.error('Failed to upload file')
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleMobileFileUpload = async () => {
    if (!uploadedMobileFile) return null

    setIsUploading(true)
    try {
      const fileExtension = uploadedMobileFile.name.split('.').pop()
      const fileName = `carousel-mobile-${Date.now()}.${fileExtension}`
      
      const blob = await uploadAdminFile(fileName, uploadedMobileFile)
      
      toast.success('Mobile banner uploaded successfully!')
      return blob.url
    } catch (error) {
      console.error('Mobile file upload error:', error)
      toast.error('Failed to upload mobile banner')
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    // Clean up object URL to prevent memory leaks
    if (formData.imageSrc && formData.imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageSrc)
    }
    
    setUploadedFile(null)
    setFormData({ ...formData, imageSrc: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveMobileFile = () => {
    // Clean up object URL to prevent memory leaks
    if (formData.mobileBannerSrc && formData.mobileBannerSrc.startsWith('blob:')) {
      URL.revokeObjectURL(formData.mobileBannerSrc)
    }
    
    setUploadedMobileFile(null)
    setFormData({ ...formData, mobileBannerSrc: "" })
    if (mobileFileInputRef.current) {
      mobileFileInputRef.current.value = ""
    }
  }

  const toggleUploadMethod = (useFile: boolean) => {
    // Clean up object URL to prevent memory leaks
    if (formData.imageSrc && formData.imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageSrc)
    }

    setUseFileUpload(useFile)
    if (!useFile) {
      // Switching to URL input
      setUploadedFile(null)
      setFormData({ ...formData, imageSrc: "" })
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } else {
      // Switching to file upload
      setFormData({ ...formData, imageSrc: "" })
    }
  }

  const toggleMobileUploadMethod = (useFile: boolean) => {
    // Clean up object URL to prevent memory leaks
    if (formData.mobileBannerSrc && formData.mobileBannerSrc.startsWith('blob:')) {
      URL.revokeObjectURL(formData.mobileBannerSrc)
    }

    setUseMobileFileUpload(useFile)
    if (!useFile) {
      // Switching to URL input
      setUploadedMobileFile(null)
      setFormData({ ...formData, mobileBannerSrc: "" })
      if (mobileFileInputRef.current) {
        mobileFileInputRef.current.value = ""
      }
    } else {
      // Switching to file upload
      setFormData({ ...formData, mobileBannerSrc: "" })
    }
  }

  const loadCarouselData = useCallback(async (id: string) => {
    setIsLoadingData(true)
    try {
      const response = await adminFetch(`/api/admin/carousel/${id}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load carousel item')
      }

      const data = await response.json()
      const item = data.item

      // Convert the database item to form data
      const carouselFormData: CarouselFormData = {
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        betChance: item.betChance,
        description: item.description,
        imageSrc: item.imageSrc,
        marketId: item.marketId,
        useSocialImage: item.useSocialImage,
        mobileBannerSrc: item.mobileBannerSrc,
        alignment: item.alignment?.toLowerCase() as "left" | "center",
        isVideo: item.isVideo,
        primaryButtonText: item.primaryButtonText,
        primaryButtonLink: item.primaryButtonLink,
        secondaryButtonText: item.secondaryButtonText,
        secondaryButtonLink: item.secondaryButtonLink,
        status: item.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }

      setFormData(carouselFormData)
    } catch (error) {
      console.error('Error loading carousel data:', error)
      toast.error(error instanceof Error ? error.message : "Failed to load carousel item data")
    } finally {
      setIsLoadingData(false)
    }
  }, [adminFetch])

  useEffect(() => {
    if (isEditing && itemId) {
      loadCarouselData(itemId)
    }
  }, [isEditing, itemId, loadCarouselData, adminFetch])

  // Fetch markets for dropdown
  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoadingMarkets(true)
      try {
        const response = await adminFetch('/api/admin/markets')
        
        if (!response.ok) {
          throw new Error('Failed to fetch markets')
        }

        const data = await response.json()
        // Map to simpler format for dropdown
        const marketList = data.markets.map((market: { id: string; question: string; contractAddress: string }) => ({
          id: market.id,
          question: market.question,
          contractAddress: market.contractAddress
        }))
        setMarkets(marketList)
      } catch (error) {
        console.error('Failed to fetch markets:', error)
        toast.error('Failed to load markets list')
      } finally {
        setIsLoadingMarkets(false)
      }
    }

    fetchMarkets()
  }, [adminFetch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {

      let finalImageSrc = formData.imageSrc
      let finalMobileBannerSrc = formData.mobileBannerSrc

      // If using file upload and there's a file, upload it first
      if (useFileUpload && uploadedFile) {
        try {
          const uploadedUrl = await handleFileUpload()
          if (!uploadedUrl) {
            throw new Error('Failed to upload file')
          }
          finalImageSrc = uploadedUrl
        } catch (uploadError) {
          console.error('File upload failed:', uploadError)
          return // Stop submission if upload fails
        }
      }

      // If using mobile file upload and there's a file, upload it first
      if (useMobileFileUpload && uploadedMobileFile) {
        try {
          const uploadedMobileUrl = await handleMobileFileUpload()
          if (!uploadedMobileUrl) {
            throw new Error('Failed to upload mobile banner')
          }
          finalMobileBannerSrc = uploadedMobileUrl
        } catch (uploadError) {
          console.error('Mobile file upload failed:', uploadError)
          return // Stop submission if upload fails
        }
      }

      // Validate that we have an image source
      if (!finalImageSrc) {
        toast.error("Please provide an image source or upload a file")
        return
      }


      const submitData = {
        ...formData,
        imageSrc: finalImageSrc,
        mobileBannerSrc: finalMobileBannerSrc,
        alignment: formData.alignment?.toLowerCase()
      }

      if (isEditing && itemId) {
        // Update existing carousel item
        const response = await adminFetch(`/api/admin/carousel/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify(submitData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update carousel item')
        }

        toast.success("Carousel item updated successfully")
      } else {
        // Create new carousel item
        const response = await adminFetch('/api/admin/carousel', {
          method: 'POST',
          body: JSON.stringify({
            ...submitData,
            status: formData.status || 'DRAFT'
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create carousel item')
        }

        toast.success("Carousel item created successfully")
      }
      
      router.push("/admin/manage-carousel")
    } catch (error) {
      console.error('Error saving carousel item:', error)
      toast.error(error instanceof Error ? error.message : "Failed to save carousel item")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/manage-carousel")
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">
            {isEditing ? "Edit Carousel Item" : "Create Carousel Item"}
          </h1>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={fillTestData}>
            Use Test Data
          </Button>
        )}
      </div>

      {/* Form Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Carousel Item" : "Create New Carousel Item"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Update the carousel item details below" 
              : "Fill in the details to create a new carousel item for the homepage"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter carousel title"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Enter carousel subtitle"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="e.g., Sep 1st 2024 00:00am UTC"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="betChance">Bet Chance (%)</Label>
                <Input
                  id="betChance"
                  type="number"
                  value={formData.betChance || ""}
                  onChange={(e) => setFormData({ ...formData, betChance: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Enter bet chance percentage"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter carousel description"
                rows={3}
              />
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Image/Video Source *</Label>
                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    variant={useFileUpload ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleUploadMethod(true)}
                  >
                    File Upload
                  </Button>
                  <Button
                    type="button"
                    variant={!useFileUpload ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleUploadMethod(false)}
                  >
                    URL Input
                  </Button>
                </div>

                {useFileUpload ? (
                  <div className="space-y-3">
                    {(uploadedFile || formData.imageSrc) ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-600 font-medium">
                              {uploadedFile ? uploadedFile.name : formData.imageSrc.split('/').pop() || 'Existing banner'}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {uploadedFile && (
                          <div className="text-xs text-muted-foreground">
                            File size: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                            {uploadedFile.type.startsWith('video/') && ' (Video detected)'}
                            {uploadedFile.type.startsWith('image/') && ' (Image detected)'}
                          </div>
                        )}
                        {!uploadedFile && formData.imageSrc && (
                          <div className="text-xs text-muted-foreground">
                            Banner from database
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <Label
                          htmlFor="file-upload"
                          className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-muted hover:border-muted-foreground/20 rounded-md cursor-pointer transition-colors text-foreground"
                        >
                          <Upload className="h-4 w-4" />
                          Choose File
                        </Label>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    id="imageSrc"
                    value={formData.imageSrc}
                    onChange={(e) => setFormData({ ...formData, imageSrc: e.target.value })}
                    placeholder="/banners/image.png or /banners/video.mp4"
                    required={!useFileUpload}
                  />
                )}
              </div>

              <div className="grid gap-2">
                <Label>Mobile Banner Source (Optional)</Label>
                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    variant={useMobileFileUpload ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMobileUploadMethod(true)}
                  >
                    File Upload
                  </Button>
                  <Button
                    type="button"
                    variant={!useMobileFileUpload ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMobileUploadMethod(false)}
                  >
                    URL Input
                  </Button>
                </div>

                {useMobileFileUpload ? (
                  <div className="space-y-3">
                    {(uploadedMobileFile || formData.mobileBannerSrc) ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-600 font-medium">
                              {uploadedMobileFile ? uploadedMobileFile.name : formData.mobileBannerSrc?.split('/').pop() || 'Existing mobile banner'}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveMobileFile}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {uploadedMobileFile && (
                          <div className="text-xs text-muted-foreground">
                            File size: {(uploadedMobileFile.size / (1024 * 1024)).toFixed(2)} MB (Mobile banner)
                          </div>
                        )}
                        {!uploadedMobileFile && formData.mobileBannerSrc && (
                          <div className="text-xs text-muted-foreground">
                            Mobile banner from database
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          ref={mobileFileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleMobileFileSelect}
                          className="hidden"
                          id="mobile-file-upload"
                        />
                        <Label
                          htmlFor="mobile-file-upload"
                          className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-muted hover:border-muted-foreground/20 rounded-md cursor-pointer transition-colors text-foreground"
                        >
                          <Upload className="h-4 w-4" />
                          Choose Mobile Banner
                        </Label>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    id="mobileBannerSrc"
                    value={formData.mobileBannerSrc || ""}
                    onChange={(e) => setFormData({ ...formData, mobileBannerSrc: e.target.value })}
                    placeholder="/banners/mobile-banner.png"
                  />
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="alignment">Text Alignment *</Label>
                <Select
                  value={formData.alignment}
                  onValueChange={(value) => setFormData({ ...formData, alignment: value as "left" | "center" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select text alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status || "DRAFT"}
                  onValueChange={(value) => setFormData({ ...formData, status: value as "DRAFT" | "PUBLISHED" | "ARCHIVED" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="marketId">Link Market (Optional)</Label>
                <Select
                  value={formData.marketId || "none"}
                  onValueChange={(value) => {
                    setFormData({ ...formData, marketId: value === "none" ? "" : value })
                    setMarketSearchQuery("")
                  }}
                  disabled={isLoadingMarkets}
                  onOpenChange={(open) => {
                    if (!open) setMarketSearchQuery("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingMarkets ? "Loading markets..." : "Select a market"} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 pb-2 sticky top-0 bg-background z-10">
                      <Input
                        placeholder="Search markets..."
                        value={marketSearchQuery}
                        onChange={(e) => setMarketSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="h-8"
                      />
                    </div>
                    <SelectItem value="none">None (use uploaded banner)</SelectItem>
                    {markets
                      .filter((market) =>
                        market.question.toLowerCase().includes(marketSearchQuery.toLowerCase())
                      )
                      .map((market) => (
                        <SelectItem key={market.id} value={market.id}>
                          {market.question}
                        </SelectItem>
                      ))}
                    {marketSearchQuery && 
                      markets.filter((market) =>
                        market.question.toLowerCase().includes(marketSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          No markets found
                        </div>
                      )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a market to use its dynamically generated OG image as the banner
                </p>
                
                {formData.marketId && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="useSocialImage"
                      checked={formData.useSocialImage || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, useSocialImage: checked as boolean })}
                    />
                    <label
                      htmlFor="useSocialImage"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Use market&apos;s social image instead of uploaded banner
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Button Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="primaryButtonText">Primary Button Text</Label>
                  <Input
                    id="primaryButtonText"
                    value={formData.primaryButtonText || ""}
                    onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                    placeholder="e.g., September 2024"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="primaryButtonLink">Primary Button Link</Label>
                  <Input
                    id="primaryButtonLink"
                    value={formData.primaryButtonLink || ""}
                    onChange={(e) => setFormData({ ...formData, primaryButtonLink: e.target.value })}
                    placeholder="e.g., /market/123 or #"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="secondaryButtonText">Secondary Button Text</Label>
                  <Input
                    id="secondaryButtonText"
                    value={formData.secondaryButtonText || ""}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                    placeholder="e.g., Place your bet"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="secondaryButtonLink">Secondary Button Link</Label>
                  <Input
                    id="secondaryButtonLink"
                    value={formData.secondaryButtonLink || ""}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                    placeholder="e.g., /market/123 or #"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Live Preview</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={previewMode === 'desktop' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    Desktop
                  </Button>
                  <Button
                    type="button"
                    variant={previewMode === 'mobile' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    Mobile
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                {formData.imageSrc ? (
                  <div className={previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}>
                    <BannerCarousel 
                      banners={[
                        {
                          id: "preview-banner",
                          title: formData.title,
                          subtitle: formData.subtitle,
                          marketId: formData.marketId,
                          useSocialImage: formData.useSocialImage,
                          date: formData.date,
                          betChance: formData.betChance,
                          description: formData.description,
                          imageSrc: formData.imageSrc,
                          mobileBannerSrc: formData.mobileBannerSrc,
                          alignment: formData.alignment,
                          isVideo: formData.isVideo,
                          primaryButtonText: formData.primaryButtonText,
                          primaryButtonLink: formData.primaryButtonLink,
                          secondaryButtonText: formData.secondaryButtonText,
                          secondaryButtonLink: formData.secondaryButtonLink
                        }
                      ]}
                      autoPlayInterval={999999} // Disable auto-play for preview
                      className={previewMode === 'mobile' ? 'mobile-preview' : ''}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-gray-500 bg-gray-100" style={{ aspectRatio: '1368/650' }}>
                    <div className="text-center">
                      <p className="text-lg mb-2">No image selected</p>
                      <p className="text-sm">Add an image source to see the preview</p>
                    </div>
                  </div>
                )}
              </div>
              {formData.mobileBannerSrc && (
                <div className="text-xs text-muted-foreground mt-2">
                  💡 Mobile banner will be shown on mobile devices. Desktop banner will be used as fallback.
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading || isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isUploading ? "Uploading..." : isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update Item" : "Create Item"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
