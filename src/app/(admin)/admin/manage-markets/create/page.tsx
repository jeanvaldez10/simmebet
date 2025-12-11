"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useMarketForm } from "./hooks/useMarketForm"
import { BasicInformationForm } from "./components/BasicInformationForm"
import { ContractParametersForm } from "./components/ContractParametersForm"
import { AdvancedConfigurationForm } from "./components/AdvancedConfigurationForm"
import { TokenConfigurationForm } from "./components/TokenConfigurationForm"
import { CreatorInformationForm } from "./components/CreatorInformationForm"
import { ResolutionEvidenceForm } from "./components/ResolutionEvidenceForm"
import { FileUpload } from "./components/FileUpload"
import { ResolveMarketModal } from "./components/ResolveMarketModal"

export default function CreateMarketPage() {
  const {
    // State
    formData,
    setFormData,
    marketFormData,
    setMarketFormData,
    categories,
    rulesText,
    setRulesText,
    selectedDate,
    setSelectedDate,
    datePickerOpen,
    setDatePickerOpen,
    uploadedFile,
    setUploadedFile,
    uploadedSquareFile,
    setUploadedSquareFile,
    uploadedSocialFile,
    setUploadedSocialFile,
    uploadedYesIconFile,
    setUploadedYesIconFile,
    uploadedNoIconFile,
    setUploadedNoIconFile,
    useFileUpload,
    setUseFileUpload,
    useSquareFileUpload,
    setUseSquareFileUpload,
    useSocialFileUpload,
    setUseSocialFileUpload,
    useYesIconUpload,
    setUseYesIconUpload,
    useNoIconUpload,
    setUseNoIconUpload,
    isLoading,
    isLoadingData,
    isUploading,
    isUploadingYesIcon,
    isUploadingNoIcon,
    isEditing,
    marketId,
    
    // Actions
    handleSubmit,
    handleCancel,
    handleResolveMarket,
    fillTestData,
    handleRegularImageUpload,
    handleSquareImageUpload,
    handleSocialImageUpload,
    handleYesIconUpload,
    handleNoIconUpload
  } = useMarketForm()

  // State for resolve market modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)


  const handleRemoveFile = () => {
    if (formData.image && formData.image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.image)
    }
    setUploadedFile(null)
    setFormData({ ...formData, image: "" })
  }

  const toggleUploadMethod = (useFile: boolean) => {
    if (formData.image && formData.image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.image)
    }
    setUseFileUpload(useFile)
    if (!useFile) {
      setUploadedFile(null)
      setFormData({ ...formData, image: "" })
    } else {
      setFormData({ ...formData, image: "" })
    }
  }

  const handleRemoveSquareFile = () => {
    if (formData.imageSquare && formData.imageSquare.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageSquare)
    }
    setUploadedSquareFile(null)
    setFormData({ ...formData, imageSquare: "" })
  }

  const toggleSquareUploadMethod = (useFile: boolean) => {
    if (formData.imageSquare && formData.imageSquare.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageSquare)
    }
    setUseSquareFileUpload(useFile)
    if (!useFile) {
      setUploadedSquareFile(null)
      setFormData({ ...formData, imageSquare: "" })
    } else {
      setFormData({ ...formData, imageSquare: "" })
    }
  }

  const handleRegularImageFileSelect = async (file: File | null) => {
    setUploadedFile(file)
    if (file) {
      try {
        await handleRegularImageUpload(file)
      } catch (error) {
        console.error("Failed to upload regular image:", error)
        // Revert the file selection on error
        setUploadedFile(null)
      }
    }
  }

  const handleSquareImageFileSelect = async (file: File | null) => {
    setUploadedSquareFile(file)
    if (file) {
      try {
        await handleSquareImageUpload(file)
      } catch (error) {
        console.error("Failed to upload square image:", error)
        // Revert the file selection on error
        setUploadedSquareFile(null)
      }
    }
  }

  const handleRemoveSocialFile = () => {
    if (formData.socialImage && formData.socialImage.startsWith('blob:')) {
      URL.revokeObjectURL(formData.socialImage)
    }
    setUploadedSocialFile(null)
    setFormData({ ...formData, socialImage: "" })
  }

  const toggleSocialUploadMethod = (useFile: boolean) => {
    if (formData.socialImage && formData.socialImage.startsWith('blob:')) {
      URL.revokeObjectURL(formData.socialImage)
    }
    setUseSocialFileUpload(useFile)
    if (!useFile) {
      setUploadedSocialFile(null)
      setFormData({ ...formData, socialImage: "" })
    } else {
      setFormData({ ...formData, socialImage: "" })
    }
  }

  const handleSocialImageFileSelect = async (file: File | null) => {
    setUploadedSocialFile(file)
    if (file) {
      try {
        await handleSocialImageUpload(file)
      } catch (error) {
        console.error("Failed to upload social image:", error)
        // Revert the file selection on error
        setUploadedSocialFile(null)
      }
    }
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
            {isEditing ? "Edit Market" : "Create Market"}
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
          <CardTitle>{isEditing ? "Edit Market" : "Create New Market"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Update the market details below" 
              : "Fill in the details to create a new prediction market"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <BasicInformationForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              datePickerOpen={datePickerOpen}
              setDatePickerOpen={setDatePickerOpen}
              rulesText={rulesText}
              setRulesText={setRulesText}
            />

            {/* Contract Creation Parameters */}
            <ContractParametersForm
              initialLiquidity={marketFormData.initialLiquidity}
              setInitialLiquidity={(value) => setMarketFormData({ ...marketFormData, initialLiquidity: value })}
              initialOdds={marketFormData.initialOdds}
              setInitialOdds={(value) => setMarketFormData({ ...marketFormData, initialOdds: value })}
            />

            {/* Market Images */}
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Market Images</h3>
              
              {/* Regular Image */}
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Regular Image (Landscape)</Label>
                <FileUpload
                  file={uploadedFile}
                  onFileSelect={handleRegularImageFileSelect}
                  onRemoveFile={handleRemoveFile}
                  id="file-upload"
                  label=""
                  placeholder="/markets/image.png or https://..."
                  useFileUpload={useFileUpload}
                  onToggleUploadMethod={toggleUploadMethod}
                  imageSrc={formData.image || undefined}
                  onImageSrcChange={(src) => setFormData({ ...formData, image: src || undefined })}
                  previewSize="full"
                />
              </div>

              {/* Square Image */}
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Square Image</Label>
                <FileUpload
                  file={uploadedSquareFile}
                  onFileSelect={handleSquareImageFileSelect}
                  onRemoveFile={handleRemoveSquareFile}
                  id="square-file-upload"
                  label=""
                  placeholder="/markets/square.png or https://..."
                  useFileUpload={useSquareFileUpload}
                  onToggleUploadMethod={toggleSquareUploadMethod}
                  imageSrc={formData.imageSquare || undefined}
                  onImageSrcChange={(src) => setFormData({ ...formData, imageSquare: src || undefined })}
                  previewSize="square"
                />
              </div>

              {/* Social Image */}
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Social Image (OG Image - 1920x1080)</Label>
                <p className="text-xs text-muted-foreground">
                  This image will be used as the background for social media previews (Twitter, Facebook, etc.)
                </p>
                <FileUpload
                  file={uploadedSocialFile}
                  onFileSelect={handleSocialImageFileSelect}
                  onRemoveFile={handleRemoveSocialFile}
                  id="social-file-upload"
                  label=""
                  placeholder="/markets/social.png or https://..."
                  useFileUpload={useSocialFileUpload}
                  onToggleUploadMethod={toggleSocialUploadMethod}
                  imageSrc={formData.socialImage || undefined}
                  onImageSrcChange={(src) => setFormData({ ...formData, socialImage: src || undefined })}
                  previewSize="full"
                />
              </div>
            </div>

            {/* Token Configuration */}
            <TokenConfigurationForm
              formData={formData}
              setFormData={setFormData}
              uploadedYesIconFile={uploadedYesIconFile}
              setUploadedYesIconFile={setUploadedYesIconFile}
              uploadedNoIconFile={uploadedNoIconFile}
              setUploadedNoIconFile={setUploadedNoIconFile}
              useYesIconUpload={useYesIconUpload}
              setUseYesIconUpload={setUseYesIconUpload}
              useNoIconUpload={useNoIconUpload}
              setUseNoIconUpload={setUseNoIconUpload}
              handleYesIconUpload={handleYesIconUpload}
              handleNoIconUpload={handleNoIconUpload}
            />

            {/* Creator Information */}
            <CreatorInformationForm formData={formData} />

            {/* Resolution Evidence - Only shown for resolved markets */}
            <ResolutionEvidenceForm
              formData={formData}
              setFormData={setFormData}
            />

            {/* Advanced Configuration */}
            <AdvancedConfigurationForm
              formData={marketFormData}
              setFormData={setMarketFormData}
            />

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              {isEditing && formData.status === "ACTIVE" && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setIsResolveModalOpen(true)}
                  disabled={isLoading || isUploading || isUploadingYesIcon || isUploadingNoIcon}
                >
                  Resolve Market
                </Button>
              )}
              <Button type="submit" disabled={isLoading || isUploading || isUploadingYesIcon || isUploadingNoIcon}>
                {isLoading || isUploading || isUploadingYesIcon || isUploadingNoIcon ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isUploading ? "Uploading..." : 
                     isUploadingYesIcon ? "Uploading Yes Icon..." :
                     isUploadingNoIcon ? "Uploading No Icon..." :
                     isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update Market" : "Create Market"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Resolve Market Modal */}
      <ResolveMarketModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onResolve={handleResolveMarket}
        marketName={formData.name}
        marketAddress={formData.contractAddress}
        marketId={marketId || ""}
        yesSideName={formData.yesSideName}
        noSideName={formData.noSideName}
        tieIsPossible={formData.tieIsPossible}
      />
    </div>
  )
}
