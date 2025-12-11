import { useRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FileUploadProps {
  file: File | null
  onFileSelect: (file: File | null) => void
  onRemoveFile: () => void
  accept?: string
  id: string
  label: string
  placeholder?: string
  useFileUpload: boolean
  onToggleUploadMethod: (useFile: boolean) => void
  imageSrc?: string
  onImageSrcChange?: (src: string | null) => void
  previewSize?: "small" | "full" | "square"
}

export const FileUpload: React.FC<FileUploadProps> = ({
  file,
  onFileSelect,
  onRemoveFile,
  accept = "image/*",
  id,
  label,
  placeholder,
  useFileUpload,
  onToggleUploadMethod,
  imageSrc,
  onImageSrcChange,
  previewSize = "small"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    onFileSelect(selectedFile || null)
  }

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2 mb-3">
        <Button
          type="button"
          variant={useFileUpload ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleUploadMethod(true)}
        >
          File Upload
        </Button>
        <Button
          type="button"
          variant={!useFileUpload ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleUploadMethod(false)}
        >
          URL Input
        </Button>
      </div>

      {useFileUpload ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              id={id}
            />
            <Label
              htmlFor={id}
              className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-muted hover:border-muted-foreground/20 rounded-md cursor-pointer transition-colors text-foreground"
            >
              <Upload className="h-4 w-4" />
              Choose {label}
            </Label>
            {file && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 font-medium">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveFile}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {file && (
            <div className="text-xs text-muted-foreground">
              File size: {(file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          )}
        </div>
      ) : (
        <Input
          id={id}
          value={imageSrc || ""}
          onChange={(e) => onImageSrcChange?.(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {imageSrc && (
        <div className="grid gap-2">
          <Label>Preview</Label>
          <div className={`border rounded-lg overflow-hidden ${
            previewSize === "full" ? "max-w-md" : 
            previewSize === "square" ? "w-32 h-32" : 
            "w-20 h-20"
          }`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imageSrc} 
              alt={`${label} preview`} 
              className={
                previewSize === "full" ? "w-full h-auto" : 
                previewSize === "square" ? "w-full h-full object-cover" :
                "w-full h-full object-cover"
              }
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/placeholder.png'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
