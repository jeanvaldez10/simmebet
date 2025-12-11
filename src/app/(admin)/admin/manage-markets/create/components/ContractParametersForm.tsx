import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Utility function to format numbers with commas
const formatNumberWithCommas = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

// Utility function to parse comma-formatted numbers
const parseCommaFormattedNumber = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0
}

interface ContractParametersFormProps {
  initialLiquidity: number
  setInitialLiquidity: (value: number) => void
  initialOdds: number
  setInitialOdds: (value: number) => void
}

export const ContractParametersForm: React.FC<ContractParametersFormProps> = ({
  initialLiquidity,
  setInitialLiquidity,
  initialOdds,
  setInitialOdds
}) => {
  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold">Contract Creation Parameters</h3>
      <p className="text-sm text-muted-foreground">
        These parameters will be used to create the smart contract. Contract and pool addresses will be generated automatically.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label htmlFor="initialLiquidity">Initial Liquidity (USD) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="initialLiquidity"
              type="text"
              value={initialLiquidity === 0 ? "" : formatNumberWithCommas(initialLiquidity)}
              onChange={(e) => {
                const numericValue = parseCommaFormattedNumber(e.target.value)
                setInitialLiquidity(numericValue)
              }}
              placeholder="1,000.00"
              className="pl-8"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">Amount in USD to initialize the market liquidity</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="initialOdds">Initial Odds (%)</Label>
          <Input
            id="initialOdds"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={initialOdds === 0 ? "" : initialOdds}
            onChange={(e) => {
              const numericValue = parseFloat(e.target.value) || 0
              setInitialOdds(Math.min(100, Math.max(0, numericValue)))
            }}
            placeholder="50"
          />
          <p className="text-xs text-muted-foreground">Initial odds percentage (0-100) for the market</p>
        </div>
      </div>
    </div>
  )
}
