import Image from "next/image";

const Banner = () => {
  const tickerItems = [
    { category: "Sports", value: "+$8,087 USD", positive: true },
    { category: "JohnDoe", value: "+$8,087 USD", positive: true },
    { category: "Global Elections", value: "+$8,087 USD", positive: true },
    { category: "MisterVGM", value: "+$8,087 USD", positive: true },
    { category: "Pop Culture", value: "+$8,087 USD", positive: true },
    { category: "Michael_Scott", value: "+$8,087 USD", positive: true },
    { category: "Sports", value: "+$8,087 USD", positive: true },
    { category: "JohnDoe", value: "+$8,087 USD", positive: true },
    { category: "Global Elections", value: "+$8,087 USD", positive: true },
    { category: "MisterVGM", value: "+$8,087 USD", positive: true },
    { category: "Pop Culture", value: "+$8,087 USD", positive: true },
  ];

  return (
    <div className="relative overflow-x-scroll scrollbar-hide py-3 w-screen">
      <div className="flex animate-scroll whitespace-nowrap gap-8 min-w-full">
        {tickerItems.map((item, index) => (
          <div key={`first-${index}`} className="flex items-center gap-4">
            <div className="w-2 h-full bg-white/50"></div>
            <span className="text-gray-300 text-sm font-medium">
              {item.category}
            </span>
            <span
              className={`text-sm font-semibold ${
                item.positive ? "text-green-400" : "text-red-400"
              }`}
            >
              {item.value}
            </span>
            <Image
              src="/images/arrow-up.png"
              alt="dots"
              width={16}
              height={16}
            />
            <Image src="/images/dots.png" alt="dots" width={16} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banner;
