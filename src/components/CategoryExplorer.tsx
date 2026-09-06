import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

import photography from "@/assets/cat-photography.jpg";
import venue from "@/assets/cat-venue.jpg";
import catering from "@/assets/cat-catering.jpg";
import decor from "@/assets/cat-decor.jpg";
import music from "@/assets/cat-music.jpg";

type Tile = {
  category: string;
  amharic: string;
  image: string;
  note: string;
  span: string;
  ratio: string;
  offset?: string;
};

/** Categories mirror lib/data CATEGORIES so the links always resolve to real filters. */
const TILES: Tile[] = [
  {
    category: "Photography",
    amharic: "ፎቶግራፍ",
    image: photography,
    note: "The people who will hand your children this day.",
    span: "md:col-span-7",
    ratio: "aspect-4/5",
  },
  {
    category: "Venue",
    amharic: "አዳራሽ",
    image: venue,
    note: "Gardens, ballrooms and rooftops across Ethiopia.",
    span: "md:col-span-5",
    ratio: "aspect-3/4",
    offset: "md:mt-20",
  },
  {
    category: "Decor",
    amharic: "ማስጌጥ",
    image: decor,
    note: "Roses, olive branches, brass, candlelight.",
    span: "md:col-span-4",
    ratio: "aspect-square",
  },
  {
    category: "Catering",
    amharic: "ምግብ",
    image: catering,
    note: "From the coffee ceremony to the last plate.",
    span: "md:col-span-4",
    ratio: "aspect-4/5",
    offset: "md:mt-14",
  },
  {
    category: "Music",
    amharic: "ሙዚቃ",
    image: music,
    note: "Kirar, azmari, DJs — the eskista never stops.",
    span: "md:col-span-4",
    ratio: "aspect-4/5",
    offset: "md:mt-28",
  },
];

export function CategoryExplorer() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
      {TILES.map((tile, i) => (
        <Reveal
          key={tile.category}
          variant="zoom"
          delay={i * 70}
          className={cn("group/tile", tile.span, tile.offset)}
        >
          <Link
            to="/vendors"
            search={{ category: tile.category, sort: "rating" }}
            className="block focus-visible:outline-offset-4"
            aria-label={`Browse ${tile.category} vendors`}
          >
            <div className={cn("relative w-full overflow-hidden bg-parchment", tile.ratio)}>
              <img
                src={tile.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:scale-[1.06]"
              />
              <div className="scrim-bottom absolute inset-0" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-espresso-foreground sm:p-6">
                <div>
                  <p className="font-ethiopic text-sm text-accent">{tile.amharic}</p>
                  <h3 className="font-display mt-1 text-3xl sm:text-4xl">{tile.category}</h3>
                  <p className="mt-2 max-w-56 text-sm leading-snug text-current/80">{tile.note}</p>
                </div>
                <ArrowUpRight
                  className="h-6 w-6 shrink-0 translate-y-1 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:translate-y-0 group-hover/tile:opacity-100"
                  aria-hidden
                />
              </div>
            </div>
          </Link>
        </Reveal>
      ))}

      {/* Text-only tile — a pause in the photography rhythm */}
      <Reveal
        className="md:col-span-8 md:mt-28 flex flex-col justify-between border-t border-foreground/15 pt-6"
        delay={140}
      >
        <div>
          <p className="type-label text-muted-foreground">Also on Shergud</p>
          <p className="font-display mt-4 text-3xl leading-tight sm:text-4xl">
            Cakes, dresses, makeup artists, ushers, tents, video, transport — the long tail of a
            wedding, all in one directory.
          </p>
        </div>
        <Link
          to="/vendors"
          search={{ sort: "rating" }}
          className="link-arrow type-label mt-8 self-start border-b border-foreground/30 pb-1.5 transition-colors hover:border-primary hover:text-primary"
        >
          See every vendor
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </Reveal>
    </div>
  );
}
