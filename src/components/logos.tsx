import Marquee from "@/components/magicui/marquee";
import Image from "next/image";

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Netflix",
  "YouTube",
  "Instagram",
  "Uber",
  "Spotify",
];

export default function Logos() {
  return (
    <section id="logos">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <h3 className="text-center text-sm font-semibold bg-gradient-to-br from-black dark:from-white from-30% to-black/40 dark:to-white/40 bg-clip-text text-transparent uppercase tracking-wider">
          Trusted by Leading Teams
        </h3>
        <div className="relative mt-6">
          <Marquee className="max-w-full [--duration:40s]">
            {companies.map((logo, idx) => (
              <Image
                key={idx}
                width={112}
                height={40}
                src={`https://cdn.magicui.design/companies/${logo}.svg`}
                className="h-10 w-28 brightness-200 dark:brightness-200 contrast-200 grayscale opacity-70 dark:opacity-90 hover:opacity-100 transition-opacity duration-300"
                alt={logo}
              />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
