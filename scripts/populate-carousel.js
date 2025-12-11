const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Carousel data from carouselData.ts
const carouselBanners = [
  {
    id: "alien-video",
    title: "",
    subtitle: "",
    date: "",
    description: "",
    imageSrc: "/banners/ALIEN_DESKTOP.mp4",
    alignment: "center",
    isVideo: true,
  },
  {
    id: "chiefs-vs-chargers",
    title: "",
    subtitle: "",
    date: "",
    betChance: 72,
    description: "",
    imageSrc: "/banners/CHIEFS_VS_CHARGERS.png",
    alignment: "left",
    isVideo: false,
    primaryButtonText: "Sat Sep 6th 2025 12:00am UTC",
    primaryButtonLink: "#",
    secondaryButtonText: "Place your bet",
    secondaryButtonLink: "#",
  },
  {
    id: "eth-surpass-ath",
    title: "",
    subtitle: "",
    date: "",
    betChance: 72,
    description: "",
    imageSrc: "/banners/ethbanner.png",
    alignment: "left",
    isVideo: false,
    primaryButtonText: "September 2025",
    primaryButtonLink: "#",
    secondaryButtonText: "Place your bet",
    secondaryButtonLink: "#",
  },
  {
    id: "vance-vs-newsom",
    title: "",
    subtitle: "",
    date: "",
    betChance: 72,
    description: "",
    imageSrc: "/banners/vancebanner.png",
    alignment: "center",
    isVideo: false,
    primaryButtonText: "Sep 1st 2028 00:00am UTC",
    primaryButtonLink: "#",
    secondaryButtonText: "Place your bet",
    secondaryButtonLink: "#",
  },
  {
    id: "raja-prison",
    title: "",
    subtitle: "",
    date: "",
    betChance: 72,
    description: "",
    imageSrc: "/banners/rajabanner.png",
    alignment: "left",
    isVideo: false,
    primaryButtonText: "Sep 1st 2028 00:00am UTC",
    primaryButtonLink: "#",
    secondaryButtonText: "Place your bet",
    secondaryButtonLink: "#",
  },
]

async function populateCarousel() {
  console.log('🎠 Starting carousel data population...')

  try {
    // Clear existing carousel items
    console.log('🗑️  Clearing existing carousel items...')
    await prisma.carouselItem.deleteMany({})

    // Insert carousel items from carouselData.ts
    console.log('📝 Inserting carousel items...')
    
    for (let i = 0; i < carouselBanners.length; i++) {
      const banner = carouselBanners[i]
      
      const carouselItem = await prisma.carouselItem.create({
        data: {
          title: banner.title || null,
          subtitle: banner.subtitle || null,
          date: banner.date || null,
          betChance: banner.betChance || null,
          description: banner.description || null,
          imageSrc: banner.imageSrc,
          alignment: banner.alignment.toUpperCase(),
          isVideo: banner.isVideo,
          primaryButtonText: banner.primaryButtonText || null,
          primaryButtonLink: banner.primaryButtonLink || null,
          secondaryButtonText: banner.secondaryButtonText || null,
          secondaryButtonLink: banner.secondaryButtonLink || null,
          status: 'PUBLISHED', // Set all as published
          orderIndex: i, // Use array index for ordering
        }
      })

      console.log(`✅ Created carousel item: ${carouselItem.id} (${banner.imageSrc})`)
    }

    console.log(`🎉 Successfully populated ${carouselBanners.length} carousel items!`)
    
    // Verify the data
    const count = await prisma.carouselItem.count()
    console.log(`📊 Total carousel items in database: ${count}`)

  } catch (error) {
    console.error('❌ Error populating carousel data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
populateCarousel()
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
