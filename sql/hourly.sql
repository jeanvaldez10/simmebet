CREATE MATERIALIZED VIEW market_data_one_hour
AS SELECT
  time_bucket('1 hour', "timestamp") AS hour,
  "marketId",
  max(price) AS high,
  first(price, timestamp) AS open,
  last(price, timestamp) AS close,
  min(price) AS low
FROM formatted_swaps
GROUP BY hour, "marketId"
ORDER BY hour DESC, "marketId";


CREATE MATERIALIZED VIEW market_data_one_day
AS SELECT
  time_bucket('1 day', "timestamp") AS day,
  "marketId",
  max(price) AS high,
  first(price, timestamp) AS open,
  last(price, timestamp) AS close,
  min(price) AS low
FROM formatted_swaps
GROUP BY day, "marketId"
ORDER BY day DESC, "marketId";
