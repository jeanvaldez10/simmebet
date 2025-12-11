import { ChevronDownIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calender"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Market, blockchainOptions } from "../types"
import { AdminCategory } from "@/services/adminCategoryService"

interface BasicInformationFormProps {
  formData: Market
  setFormData: (data: Market) => void
  categories: AdminCategory[]
  selectedDate: Date | undefined
  setSelectedDate: (date: Date | undefined) => void
  datePickerOpen: boolean
  setDatePickerOpen: (open: boolean) => void
  rulesText: string
  setRulesText: (text: string) => void
}

export const BasicInformationForm: React.FC<BasicInformationFormProps> = ({
  formData,
  setFormData,
  categories,
  selectedDate,
  setSelectedDate,
  datePickerOpen,
  setDatePickerOpen,
  rulesText,
  setRulesText
}) => {
  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Market Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter market name"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="createdBy">Created By</Label>
          <Input
            id="createdBy"
            value={formData.createdBy}
            disabled
            className="bg-muted text-muted-foreground"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="question">Market Question *</Label>
        <Textarea
          id="question"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Enter the market question"
          required
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="categories">Categories</Label>
        <div className="space-y-3">
          {/* Selected Categories Display */}
          {formData.categoryIds && formData.categoryIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.categoryIds.map((categoryId) => {
                const category = categories.find(cat => cat.id === categoryId);
                return (
                  <Badge key={categoryId} variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-200 hover:bg-gray-600">
                    {category?.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent ml-1 text-gray-400 hover:text-gray-200"
                      onClick={() => {
                        const newCategoryIds = formData.categoryIds?.filter(id => id !== categoryId) || [];
                        setFormData({ ...formData, categoryIds: newCategoryIds });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
          
          {/* Add Category Dropdown */}
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !formData.categoryIds?.includes(value)) {
                const currentIds = formData.categoryIds || [];
                setFormData({ ...formData, categoryIds: [...currentIds, value] });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="+ Add Category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter(category => !formData.categoryIds?.includes(category.id))
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="blockchain">Blockchain</Label>
        <Select
          value={formData.blockchain}
          disabled
        >
          <SelectTrigger className="bg-muted text-muted-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {blockchainOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date">Market End Date & Time</Label>
        <div className="flex gap-2">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="flex-1 justify-between font-normal hover:bg-accent hover:text-accent-foreground dark:hover:bg-primary dark:hover:text-primary-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground dark:data-[state=open]:bg-primary dark:data-[state=open]:text-primary-foreground"
              >
                {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                captionLayout="dropdown"
                disabled={{ before: new Date() }}
                showOutsideDays={false}
                fixedWeeks={false}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    // Preserve existing time if date is already selected
                    const existingTime = selectedDate ? {
                      hours: selectedDate.getHours(),
                      minutes: selectedDate.getMinutes()
                    } : { hours: 23, minutes: 59 } // Default to end of day
                    
                    const newDateTime = new Date(date)
                    newDateTime.setHours(existingTime.hours, existingTime.minutes, 0, 0)
                    setSelectedDate(newDateTime)
                    
                    // Update form data with full datetime
                    const year = newDateTime.getFullYear()
                    const month = String(newDateTime.getMonth() + 1).padStart(2, '0')
                    const day = String(newDateTime.getDate()).padStart(2, '0')
                    const hours = String(newDateTime.getHours()).padStart(2, '0')
                    const minutes = String(newDateTime.getMinutes()).padStart(2, '0')
                    const datetimeString = `${year}-${month}-${day}T${hours}:${minutes}`
                    setFormData({ ...formData, date: datetimeString })
                  } else {
                    setSelectedDate(undefined)
                    setFormData({ ...formData, date: "" })
                  }
                  setDatePickerOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
          
          <Input
            type="time"
            value={selectedDate ? `${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}` : ""}
            onChange={(e) => {
              if (selectedDate && e.target.value) {
                const [hours, minutes] = e.target.value.split(':').map(Number)
                const newDateTime = new Date(selectedDate)
                newDateTime.setHours(hours, minutes, 0, 0)
                setSelectedDate(newDateTime)
                
                // Update form data with full datetime
                const year = newDateTime.getFullYear()
                const month = String(newDateTime.getMonth() + 1).padStart(2, '0')
                const day = String(newDateTime.getDate()).padStart(2, '0')
                const hoursStr = String(hours).padStart(2, '0')
                const minutesStr = String(minutes).padStart(2, '0')
                const datetimeString = `${year}-${month}-${day}T${hoursStr}:${minutesStr}`
                setFormData({ ...formData, date: datetimeString })
              }
            }}
            className="w-32"
            placeholder="Time"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="rules">Rules (one per line)</Label>
        <Textarea
          id="rules"
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
          placeholder="Enter market rules, one per line"
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="tieIsPossible"
          checked={formData.tieIsPossible}
          onChange={(e) => setFormData({ ...formData, tieIsPossible: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label htmlFor="tieIsPossible" className="text-sm font-medium">
          Allow tie resolution
        </Label>
        <p className="text-xs text-gray-500">
          Enable this if the market outcome could result in a tie
        </p>
      </div>
    </div>
  )
}
