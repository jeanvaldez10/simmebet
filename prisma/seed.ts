/* eslint-disable @typescript-eslint/no-require-imports */
const {
  PrismaClient,
  MarketStatus,
  BetType,
  DataType,
  Prisma,
} = require("@/generated/prisma");
const { v4: uuidv4 } = require("uuid");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

// const marketTypes = [
//   "buy",
//   "voted-yes",
//   "voted-germany",
//   "options",
//   "yes-won",
//   "germany-won",
//   "options-won",
// ];

const sampleRules = [
  'Note: This market will resolve to "Yes" if Calin Georgescu win the 2024 Romanian Presidential election.',
  "Presidential elections will be held in Romania on 24 November 2024. A second round will be held on 8 December 2024 if no candidate receives an absolute majority of the vote.",
  'This market will resolve to "Yes" if a candidate other than Mircea Geoană, Marcel Ciolacu, George Simion, Nicolae Ciucă, or Elena Lasconi wins this election. Otherwise, this market will resolve to "No".',
  'This market includes any potential second round. If the result of this election isn\'t known by April 30, 2025, 11:59 PM ET, the market will resolve to "Yes".',
  "This market will resolve solely based off the first official announcement of the election results from the Romanian Government, specifically the Permanent Electoral Authority (https://www.roaep.ro/prezentare/).",
];

const mockMarkets = [
  {
    name: "Spain vs Germany UEFA Finals 2024",
    question: "Will Spain beat Germany on the UEFA finals this year?",
    date: new Date("2024-06-30"),
    image: "/images/football.png",
    volume: 32000000,
    contractAddress: `0x${uuidv4().replace(/-/g, "")}`,
    poolAddress: `0x${uuidv4().replace(/-/g, "")}`,
    blockchain: "ETH",
    status: MarketStatus.ACTIVE,
    createdBy: "michael_scott",
    rules: sampleRules,
    yesPrice: 50,
    noPrice: 50,
    totalLiquidity: 1000000,
    yesTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    yesIcon: "/images/yes-token.png",
    noTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    noIcon: "/images/no-token.png",
    currentRatio: new Prisma.Decimal(50.0),
  },
  {
    name: "Bitcoin 100K",
    question: "Will Bitcoin reach $100k in 2024?",
    date: new Date("2024-12-31"),
    image: "/images/football.png",
    volume: 50000000,
    contractAddress: `0x${uuidv4().replace(/-/g, "")}`,
    poolAddress: `0x${uuidv4().replace(/-/g, "")}`,
    blockchain: "ETH",
    status: MarketStatus.ACTIVE,
    createdBy: "crypto_whale",
    rules: [
      "Market resolves to YES if Bitcoin price reaches or exceeds $100,000 USD on any major exchange",
      "Price must be maintained for at least 1 hour",
      "Data will be sourced from CoinGecko API",
    ],
    yesPrice: 75,
    noPrice: 25,
    totalLiquidity: 2000000,
    yesTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    yesIcon: "/images/yes-token.png",
    noTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    noIcon: "/images/no-token.png",
    currentRatio: new Prisma.Decimal(75.0),
  },
  {
    name: "Trump 2024",
    question: "Will Donald Trump win the 2024 US Presidential Election?",
    date: new Date("2024-11-05"),
    image: "/images/football.png",
    volume: 75000000,
    contractAddress: `0x${uuidv4().replace(/-/g, "")}`,
    poolAddress: `0x${uuidv4().replace(/-/g, "")}`,
    blockchain: "ETH",
    status: MarketStatus.ACTIVE,
    createdBy: "political_expert",
    rules: [
      "Market resolves to YES if Donald Trump wins the 2024 US Presidential Election",
      "Winner determined by Electoral College results",
      "Must be certified by Congress",
    ],
    yesPrice: 45,
    noPrice: 55,
    totalLiquidity: 3000000,
    yesTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    yesIcon: "/images/yes-token.png",
    noTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    noIcon: "/images/no-token.png",
    currentRatio: new Prisma.Decimal(45.0),
  },
  {
    name: "Apple VR Success",
    question: "Will Apple Vision Pro sell over 1 million units in 2024?",
    date: new Date("2024-12-31"),
    image: "/images/football.png",
    volume: 25000000,
    contractAddress: `0x${uuidv4().replace(/-/g, "")}`,
    poolAddress: `0x${uuidv4().replace(/-/g, "")}`,
    blockchain: "ETH",
    status: MarketStatus.ACTIVE,
    createdBy: "tech_analyst",
    rules: [
      "Market resolves to YES if Apple officially announces sales numbers exceeding 1 million units",
      "Third-party estimates do not count",
      "Must be calendar year 2024 sales only",
    ],
    yesPrice: 60,
    noPrice: 40,
    totalLiquidity: 1500000,
    yesTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    yesIcon: "/images/yes-token.png",
    noTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    noIcon: "/images/no-token.png",
    currentRatio: new Prisma.Decimal(60.0),
  },
  {
    name: "Oscars 2024 Best Picture",
    question: "Will 'Oppenheimer' win Best Picture at the 2024 Academy Awards?",
    date: new Date("2024-03-10"),
    image: "/images/football.png",
    volume: 15000000,
    contractAddress: `0x${uuidv4().replace(/-/g, "")}`,
    poolAddress: `0x${uuidv4().replace(/-/g, "")}`,
    blockchain: "ETH",
    status: MarketStatus.RESOLVED,
    createdBy: "movie_buff",
    rules: [
      "Market resolves to YES if Oppenheimer wins Best Picture at the 96th Academy Awards",
      "Ceremony must take place and award must be given",
      "Result based on live broadcast announcement",
    ],
    yesPrice: 100,
    noPrice: 0,
    totalLiquidity: 1000000,
    yesTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    yesIcon: "/images/yes-token.png",
    noTokenAddress: `0x${uuidv4().replace(/-/g, "")}`,
    noIcon: "/images/no-token.png",
    currentRatio: new Prisma.Decimal(100.0),
    isResolved: true,
    resolvedOption: "Yes",
  },
];

// Generate random market data
function generateMarketData(marketId: string, days: number) {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Daily data
    data.push({
      marketId,
      timestamp: date,
      dataType: DataType.DAILY,
      side: true, // YES side
      odds: new Prisma.Decimal(
        faker.number.float({ min: 20, max: 80, fractionDigits: 2 })
      ),
    });

    // Hourly data (24 entries per day)
    for (let hour = 0; hour < 24; hour++) {
      const hourlyDate = new Date(date);
      hourlyDate.setHours(hour);
      data.push({
        marketId,
        timestamp: hourlyDate,
        dataType: DataType.HOURLY,
        side: true, // YES side
        odds: new Prisma.Decimal(
          faker.number.float({ min: 20, max: 80, fractionDigits: 2 })
        ),
      });
    }
  }
  return data;
}

// Generate market activities
function generateMarketActivities(marketId: string, count: number) {
  return Array.from({ length: count }, () => ({
    marketId,
    userId: Math.random() > 0.2 ? faker.string.uuid() : null, // 20% chance of unknown user
    betType: faker.helpers.arrayElement(Object.values(BetType)),
    amount: new Prisma.Decimal(
      faker.number.float({ min: 100, max: 10000, fractionDigits: 2 })
    ),
    timestamp: faker.date.recent({ days: 30 }),
  }));
}

// Generate market tweets
function generateMarketTweets(marketId: string, count: number) {
  return Array.from({ length: count }, () => ({
    marketId,
    tweets: {
      id: faker.string.numeric(19),
      created_at: faker.date.recent().toISOString(),
      metrics: {
        likes: faker.number.int({ min: 0, max: 1000 }),
        retweets: faker.number.int({ min: 0, max: 500 }),
      },
    },
    username: faker.internet.username(),
    handle: `@${faker.internet.username()}`,
    profileImg: faker.image.avatar(),
    content: faker.lorem.sentence(),
    tweetUrl: `https://twitter.com/user/status/${faker.string.numeric(19)}`,
  }));
}

// Generate top holders
function generateTopHolders(marketId: string, count: number) {
  return Array.from({ length: count }, () => ({
    marketId,
    holderId: faker.string.uuid(),
    amount: new Prisma.Decimal(
      faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 })
    ),
    side: Math.random() > 0.5,
  }));
}

// Generate price chart data for different time periods
function generatePriceChartData(marketId: string) {
  const data = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date();
    data.push({
      marketId,
      date,
      yes: new Prisma.Decimal(
        faker.number.float({ min: 20, max: 80, fractionDigits: 2 })
      ),
      no: new Prisma.Decimal(
        faker.number.float({ min: 20, max: 80, fractionDigits: 2 })
      ),
    });
  }
  return data;
}

// Generate liquidity spread data
function generateLiquiditySpreadData(marketId: string) {
  const data = [];
  const values = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  for (const value of values) {
    data.push({
      marketId,
      value,
      percentage: new Prisma.Decimal(
        faker.number.float({ min: 20, max: 100, fractionDigits: 2 })
      ),
      type: "yes",
    });

    data.push({
      marketId,
      value,
      percentage: new Prisma.Decimal(
        faker.number.float({ min: 20, max: 100, fractionDigits: 2 })
      ),
      type: "no",
    });
  }
  return data;
}

async function main() {
  console.log("Start seeding...");

  // Create markets and related data
  for (const market of mockMarkets) {
    // Create market
    const createdMarket = await prisma.market.create({
      data: market,
    });
    console.log(`Created market with id: ${createdMarket.id}`);

    // Create current odds
    await prisma.marketCurrentOdds.create({
      data: {
        marketId: createdMarket.id,
        yesOdds: new Prisma.Decimal(
          faker.number.float({ min: 20, max: 80, fractionDigits: 2 })
        ),
        noOdds: new Prisma.Decimal(
          faker.number.float({ min: 20, max: 80, fractionDigits: 2 })
        ),
      },
    });

    // Create market data (7 days of historical data)
    const marketData = generateMarketData(createdMarket.id, 7);
    await prisma.marketData.createMany({
      data: marketData,
    });

    // Create market activities (20 activities per market)
    const activities = generateMarketActivities(createdMarket.id, 20);
    await prisma.marketActivity.createMany({
      data: activities,
    });

    // Create market tweets (10 tweets per market)
    const tweets = generateMarketTweets(createdMarket.id, 10);
    await prisma.marketTweet.createMany({
      data: tweets,
    });

    // Create top holders (5 holders per market)
    const holders = generateTopHolders(createdMarket.id, 5);
    await prisma.marketTopHolder.createMany({
      data: holders,
    });

    // Create market resolution for resolved markets
    if (market.status === MarketStatus.RESOLVED) {
      await prisma.marketResolution.create({
        data: {
          marketId: createdMarket.id,
          results: {
            finalOutcome: true,
            votingResults: {
              yes: faker.number.int({ min: 1000, max: 10000 }),
              no: faker.number.int({ min: 1000, max: 10000 }),
            },
          },
          outcome: true,
          sources: [faker.internet.url(), faker.internet.url()],
          resultFile: faker.system.filePath(),
        },
      });
    }

    // Create price chart data
    const priceChartData = generatePriceChartData(createdMarket.id);
    await prisma.priceChartData.createMany({
      data: priceChartData,
    });

    // Create liquidity spread data
    const liquiditySpreadData = generateLiquiditySpreadData(createdMarket.id);
    await prisma.liquiditySpreadData.createMany({
      data: liquiditySpreadData,
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
