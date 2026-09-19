import { useEffect, useState } from "react";
import HeroShrink from "./components/HeroShrink.jsx";
import GallerySection from "./components/GallerySection.jsx";
import OnOffSection from "./components/OnOffSection.jsx";
import Menu from "./components/Menu.jsx";
import {
  Wordmark,
  WordmarkInline,
  StoreButton,
  MenuButton,
  CloseButton,
} from "./components/Chrome.jsx";
import NextRaceCard from "./components/NextRaceCard.jsx";
import TapToLock from "./components/TapToLock.jsx";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [scrolled, setScrolled] = useState(false); // binary — for cards
  const [chromeOpacity, setChromeOpacity] = useState(1); // smooth — for wordmark/halo

  // Smoothly fade the hero-page chrome across the shrink scroll so it hands
  // off to the "MESSAGE FROM LANDO" label inside <HeroShrink /> at the end.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      // Fade window: fully visible ≤ 1.5vh scroll, hidden by 2.2vh
      const op = Math.max(0, Math.min(1, (2.2 * vh - y) / (0.7 * vh)));
      setChromeOpacity(op);
      setScrolled(y > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="w-full bg-cream">
      <HeroShrink />
      <GallerySection />
      <OnOffSection />

      {/* ============= MENU OVERLAY ============= */}
      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ============= CHROME ============= */}
      {/* Store — top-left on mobile, top-right (grouped with menu) on desktop */}
      <div className="fixed top-4 left-4 z-[60] md:hidden">
        <StoreButton />
      </div>
      <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
        <div className="hidden md:block">
          <StoreButton />
        </div>
        {menuOpen ? (
          <CloseButton onClick={() => setMenuOpen(false)} />
        ) : (
          <MenuButton onClick={() => setMenuOpen(true)} />
        )}
      </div>

      {/* Desktop wordmark top-left — hidden while menu is open */}
      {!menuOpen && (
        <div
          className="fixed top-5 left-6 z-40 hidden md:block"
          style={{ opacity: chromeOpacity }}
        >
          <Wordmark />
        </div>
      )}

      {/* Top-centre LN halo + mobile wordmark stack.
          Smoothly fades over the shrink scroll and hands off to the
          "MESSAGE FROM LANDO" label rendered by HeroShrink at the end. */}
      {!menuOpen && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 w-max z-40 flex flex-col items-center gap-2 md:top-4 md:gap-0"
          style={{
            opacity: chromeOpacity,
            pointerEvents: chromeOpacity < 0.05 ? "none" : "auto",
          }}
        >
          <div className="md:hidden flex flex-col items-center gap-1 mt-24">
            <WordmarkInline />
            <div
              className="text-[8px] tracking-[0.3em] font-bold text-black/75"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              September 1963 – July 2026
            </div>
          </div>
        </div>
      )}

      {/* Next Race — desktop only, only at rest */}
      {!menuOpen && !scrolled && (
        <div className="hidden md:block">
          <NextRaceCard race="BAKU GP" />
        </div>
      )}

      {/* Tap-to-lock — mobile only, only at rest */}
      {!menuOpen && !scrolled && (
        <div className="fixed bottom-4 right-4 z-50 md:hidden">
          <TapToLock locked={locked} onToggle={() => setLocked((v) => !v)} />
        </div>
      )}
    </div>
  );
}
