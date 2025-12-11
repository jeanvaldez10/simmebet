import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Market } from "../types"

interface CreatorInformationFormProps {
  formData: Market
}

export const CreatorInformationForm: React.FC<CreatorInformationFormProps> = ({
  formData
}) => {
  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold">Creator Information</h3>
      <p className="text-sm text-muted-foreground">
        All markets are created by Simmi. These fields are automatically set.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label htmlFor="creatorName">Creator Name</Label>
          <Input
            id="creatorName"
            value={formData.creatorName || ""}
            disabled
            className="bg-muted text-muted-foreground"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="creatorAvatar">Creator Avatar URL</Label>
          <div className="flex items-center gap-3">
            <Input
              id="creatorAvatar"
              value={formData.creatorAvatar || ""}
              disabled
              className="bg-muted text-muted-foreground flex-1"
            />
            {formData.creatorAvatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={formData.creatorAvatar} 
                alt="Creator avatar preview" 
                className="w-10 h-10 object-cover rounded-full border flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.png'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
