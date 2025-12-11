import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarketFormData } from "../types"

interface AdvancedConfigurationFormProps {
  formData: MarketFormData
  setFormData: (data: MarketFormData) => void
}

export const AdvancedConfigurationForm: React.FC<AdvancedConfigurationFormProps> = ({
  formData,
  setFormData
}) => {
  const updateFormData = (updates: Partial<MarketFormData>) => {
    setFormData({ ...formData, ...updates })
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Advanced Configuration</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => updateFormData({ showAdvancedDetails: !formData.showAdvancedDetails })}
        >
          {formData.showAdvancedDetails ? "Hide" : "View"} Advanced Details
        </Button>
      </div>
      
      {formData.showAdvancedDetails && (
        <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Advanced parameters for the external market creation API. These are pre-configured with default values and should not be changed unless you understand the implications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="collateralToken">Collateral Token Address</Label>
              <Input
                id="collateralToken"
                value={formData.collateralToken}
                onChange={(e) => updateFormData({ collateralToken: e.target.value })}
                placeholder="0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Token address for market collateral</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="oracle">Oracle Address</Label>
              <Input
                id="oracle"
                value={formData.oracle}
                onChange={(e) => updateFormData({ oracle: e.target.value })}
                placeholder="0xde374b1d1f82503aC9207e9aEA07405DF41b436F"
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Oracle contract address for market resolution</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="oracleType">Oracle Type</Label>
              <Input
                id="oracleType"
                type="number"
                value={formData.oracleType}
                onChange={(e) => updateFormData({ oracleType: parseInt(e.target.value) || 1 })}
                placeholder="1"
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Type of oracle (1 = manual, etc.)</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="creatorFeeBps">Creator Fee (BPS)</Label>
              <Input
                id="creatorFeeBps"
                type="number"
                value={formData.creatorFeeBps}
                onChange={(e) => updateFormData({ creatorFeeBps: parseInt(e.target.value) || 15 })}
                placeholder="15"
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Creator fee in basis points (100 BPS = 1%)</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="poolFee">Pool Fee</Label>
              <Input
                id="poolFee"
                type="number"
                value={formData.poolFee}
                onChange={(e) => updateFormData({ poolFee: parseInt(e.target.value) || 5000 })}
                placeholder="5000"
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Pool fee for liquidity providers</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tickSpacing">Tick Spacing</Label>
              <Input
                id="tickSpacing"
                type="number"
                value={formData.tickSpacing}
                onChange={(e) => updateFormData({ tickSpacing: parseInt(e.target.value) || 200 })}
                placeholder="200"
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Spacing between price ticks</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minTick">Min Tick</Label>
              <Input
                id="minTick"
                type="number"
                value={formData.minTick}
                onChange={(e) => updateFormData({ minTick: parseInt(e.target.value) || -887200 })}
                placeholder="-887200"
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Minimum price tick</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxTick">Max Tick</Label>
              <Input
                id="maxTick"
                type="number"
                value={formData.maxTick}
                onChange={(e) => updateFormData({ maxTick: parseInt(e.target.value) || 887200 })}
                placeholder="887200"
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Maximum price tick</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="collateralMultiplier">Collateral Multiplier</Label>
              <Input
                id="collateralMultiplier"
                type="number"
                value={formData.collateralMultiplier}
                onChange={(e) => updateFormData({ collateralMultiplier: parseInt(e.target.value) || -1000000000000 })}
                placeholder="-1000000000000"
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Collateral token multiplier</p>
            </div>


          </div>
        </div>
      )}
    </div>
  )
}
