import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Fires once when the element scrolls into view. Cheap, CSS-driven, no library. */
export function useInView<T extends HTMLElement>(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: options?.threshold ?? 0.15, rootMargin: options?.rootMargin ?? "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return { ref, visible };
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger in milliseconds. */
  delay?: number;
  variant?: "rise" | "mask" | "zoom";
};

export function Reveal({ children, as, className, delay = 0, variant = "rise" }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, visible } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      data-visible={visible}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        variant === "rise" && "reveal",
        variant === "mask" && "reveal-mask",
        variant === "zoom" && "reveal-zoom",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Word-by-word masked headline reveal. Keeps text selectable and screen-reader friendly. */
export function RevealWords({
  text,
  className,
  wordClassName,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
}) {
  const { ref, visible } = useInView<HTMLSpanElement>({ threshold: 0.2 });
  const words = text.split(" ");

  return (
    <span ref={ref} className={cn("inline", className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <span
            data-visible={visible}
            style={{ transitionDelay: `${i * 55}ms` }}
            className={cn(
              "inline-block translate-y-[110%] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-[visible=true]:translate-y-0 motion-reduce:translate-y-0",
              wordClassName,
            )}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Subtle transform-only parallax. Skipped entirely for reduced-motion users. */
export function useParallax(strength = 0.12) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      node.style.transform = `translate3d(0, ${(-progress * strength * 100).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [strength]);

  return ref;
}
