CREATE MATERIALIZED VIEW token_holders AS
WITH address_balances AS (
  SELECT 
    "chainId",
    "tokenAddress",
    "fromAddress" AS address,
    -"amount" AS balance_change
  FROM token_transfers
  
  UNION ALL
  
  SELECT 
    "chainId",
    "tokenAddress",
    "toAddress" AS address, 
    "amount" AS balance_change
  FROM token_transfers
),
balances AS (
  SELECT 
    "chainId",
    "tokenAddress",
    "address",
    SUM("balance_change") AS "total_balance"
  FROM address_balances
  GROUP BY "chainId", "tokenAddress", "address"
)
SELECT * FROM balances
WHERE "total_balance" > 0
ORDER BY "total_balance" DESC;
