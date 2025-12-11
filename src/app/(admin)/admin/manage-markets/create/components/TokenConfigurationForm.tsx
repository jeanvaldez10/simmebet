import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Market } from "../types"
import { FileUpload } from "./FileUpload"

interface TokenConfigurationFormProps {
  formData: Market
  setFormData: (data: Market) => void
  uploadedYesIconFile: File | null
  setUploadedYesIconFile: (file: File | null) => void
  uploadedNoIconFile: File | null
  setUploadedNoIconFile: (file: File | null) => void
  useYesIconUpload: boolean
  setUseYesIconUpload: (use: boolean) => void
  useNoIconUpload: boolean
  setUseNoIconUpload: (use: boolean) => void
  handleYesIconUpload: (file: File) => Promise<string>
  handleNoIconUpload: (file: File) => Promise<string>
}

export const TokenConfigurationForm: React.FC<TokenConfigurationFormProps> = ({
  formData,
  setFormData,
  uploadedYesIconFile,
  setUploadedYesIconFile,
  uploadedNoIconFile,
  setUploadedNoIconFile,
  useYesIconUpload,
  setUseYesIconUpload,
  useNoIconUpload,
  setUseNoIconUpload,
  handleYesIconUpload,
  handleNoIconUpload
}) => {
  const handleYesIconFileSelect = async (file: File | null) => {
    setUploadedYesIconFile(file)
    if (file) {
      try {
        await handleYesIconUpload(file)
      } catch (error) {
        console.error("Failed to upload yes icon:", error)
        // Revert the file selection on error
        setUploadedYesIconFile(null)
      }
    }
  }

  const handleNoIconFileSelect = async (file: File | null) => {
    setUploadedNoIconFile(file)
    if (file) {
      try {
        await handleNoIconUpload(file)
      } catch (error) {
        console.error("Failed to upload no icon:", error)
        // Revert the file selection on error
        setUploadedNoIconFile(null)
      }
    }
  }

  const handleRemoveYesIconFile = () => {
    if (formData.yesSideIcon && formData.yesSideIcon.startsWith('blob:')) {
      URL.revokeObjectURL(formData.yesSideIcon)
    }
    setUploadedYesIconFile(null)
    setFormData({ ...formData, yesSideIcon: "" })
  }

  const handleRemoveNoIconFile = () => {
    if (formData.noSideIcon && formData.noSideIcon.startsWith('blob:')) {
      URL.revokeObjectURL(formData.noSideIcon)
    }
    setUploadedNoIconFile(null)
    setFormData({ ...formData, noSideIcon: "" })
  }

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold">Token Configuration</h3>
      <p className="text-sm text-muted-foreground">
        Token addresses will be generated automatically when the market is created.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">No Side</h4>
          <div className="grid gap-2">
            <Label htmlFor="noSideName">No Side Name</Label>
            <Input
              id="noSideName"
              value={formData.noSideName}
              onChange={(e) => setFormData({ ...formData, noSideName: e.target.value })}
              placeholder="No"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="noSideSymbol">No Side Symbol</Label>
            <Input
              id="noSideSymbol"
              value={formData.noSideSymbol}
              onChange={(e) => setFormData({ ...formData, noSideSymbol: e.target.value })}
              placeholder="NO"
              required
            />
          </div>
          <FileUpload
            file={uploadedNoIconFile}
            onFileSelect={handleNoIconFileSelect}
            onRemoveFile={handleRemoveNoIconFile}
            id="no-icon-upload"
            label="No Side Icon"
            placeholder="/images/cup.png"
            useFileUpload={useNoIconUpload}
            onToggleUploadMethod={setUseNoIconUpload}
            imageSrc={formData.noSideIcon || undefined}
            onImageSrcChange={(src) => setFormData({ ...formData, noSideIcon: src || undefined })}
            previewSize="small"
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Yes Side</h4>
          <div className="grid gap-2">
            <Label htmlFor="yesSideName">Yes Side Name</Label>
            <Input
              id="yesSideName"
              value={formData.yesSideName}
              onChange={(e) => setFormData({ ...formData, yesSideName: e.target.value })}
              placeholder="Yes"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="yesSideSymbol">Yes Side Symbol</Label>
            <Input
              id="yesSideSymbol"
              value={formData.yesSideSymbol}
              onChange={(e) => setFormData({ ...formData, yesSideSymbol: e.target.value })}
              placeholder="YES"
              required
            />
          </div>
          <FileUpload
            file={uploadedYesIconFile}
            onFileSelect={handleYesIconFileSelect}
            onRemoveFile={handleRemoveYesIconFile}
            id="yes-icon-upload"
            label="Yes Side Icon"
            placeholder="/images/cup.png"
            useFileUpload={useYesIconUpload}
            onToggleUploadMethod={setUseYesIconUpload}
            imageSrc={formData.yesSideIcon || undefined}
            onImageSrcChange={(src) => setFormData({ ...formData, yesSideIcon: src || undefined })}
            previewSize="small"
          />
        </div>
      </div>
    </div>
  )
}
