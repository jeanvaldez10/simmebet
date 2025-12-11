import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

interface ResolveMarketModalProps {
  isOpen: boolean
  onClose: () => void
  onResolve: () => Promise<void>
  marketName: string
  marketAddress: string
  marketId: string
  yesSideName: string
  noSideName: string
  tieIsPossible: boolean
}

export const ResolveMarketModal: React.FC<ResolveMarketModalProps> = ({
  isOpen,
  onClose,
  onResolve,
  marketName,
  marketId,
  yesSideName,
  noSideName,
  tieIsPossible
}) => {
  const [isResolving, setIsResolving] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null)
  const [evidence, setEvidence] = useState("")
  const [isTie, setIsTie] = useState(false)

  const handleOutcomeSelect = (outcome: number) => {
    if (selectedOutcome === outcome) {
      // If clicking the same outcome, unselect it
      setSelectedOutcome(null)
    } else {
      // If clicking a different outcome, select it and clear tie
      setSelectedOutcome(outcome)
      setIsTie(false)
    }
  }

  const handleTieToggle = () => {
    if (isTie) {
      // If currently a tie, unselect tie
      setIsTie(false)
    } else {
      // If not a tie, select tie and clear any selected outcome
      setIsTie(true)
      setSelectedOutcome(null)
    }
  }

  const handleResolve = async () => {
    if (selectedOutcome === null && !isTie) return

    setIsResolving(true)
    try {
      toast.loading("Resolving market...")

      // Call internal API route to resolve market
      const response = await fetch(`/api/admin/markets/${marketId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          outcome: isTie ? 0 : selectedOutcome,
          isTie: isTie,
          evidence,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to resolve market")
      }

      await response.json()

      toast.dismiss()
      toast.success("Market resolved successfully!")
      
      // Update local database
      await onResolve()
      onClose()
    } catch (error) {
      console.error("Error resolving market:", error)
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : "Failed to resolve market")
    } finally {
      setIsResolving(false)
    }
  }

  const handleClose = () => {
    setSelectedOutcome(null)
    setEvidence("")
    setIsTie(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resolve Market</DialogTitle>
          <DialogDescription>
            Select the winning outcome for &quot;{marketName}&quot;:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={selectedOutcome === 0 ? "default" : "outline"}
              onClick={() => handleOutcomeSelect(0)}
              className={`h-20 flex items-center justify-center ${
                selectedOutcome === 0 
                  ? "bg-red-600 hover:bg-red-700 text-white border-red-600" 
                  : "border-red-600 text-red-600 hover:bg-red-50"
              }`}
            >
              <span className="text-lg font-semibold">{noSideName}</span>
            </Button>
            <Button
              type="button"
              variant={selectedOutcome === 1 ? "default" : "outline"}
              onClick={() => handleOutcomeSelect(1)}
              className={`h-20 flex items-center justify-center ${
                selectedOutcome === 1 
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                  : "border-green-600 text-green-600 hover:bg-green-50"
              }`}
            >
              <span className="text-lg font-semibold">{yesSideName}</span>
            </Button>
          </div>
          
          {tieIsPossible && (
            <div className="w-full">
              <Button
                type="button"
                variant={isTie ? "default" : "outline"}
                onClick={handleTieToggle}
                className={`w-full h-16 flex items-center justify-center ${
                  isTie 
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600" 
                    : "border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                }`}
              >
                <span className="text-lg font-semibold">TIE</span>
              </Button>
            </div>
          )}
        </div>

        {(selectedOutcome !== null || isTie) && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Selected Outcome:</strong> {isTie ? "TIE" : (selectedOutcome === 1 ? yesSideName : noSideName)}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              This action will process the external API request, update the market status to resolved, and finalize all pending positions.
              <strong className="text-red-600 block mt-1">This action cannot be undone.</strong>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Resolution Evidence (Optional)
            </label>
            <RichTextEditor
              content={evidence}
              onChange={setEvidence}
              placeholder="Add evidence or sources that support this resolution (e.g., links to news articles, official statements, etc.)"
            />
            <p className="text-xs text-gray-500 mt-1">
              This evidence will be displayed on the market page to show why the market was resolved this way.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isResolving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleResolve}
            disabled={isResolving || (selectedOutcome === null && !isTie)}
            className="bg-red-600 hover:bg-red-700"
          >
            {isResolving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Resolving...
              </>
            ) : (
              "Resolve Market"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

