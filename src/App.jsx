import { useEffect, useState } from "react";
import HeroShrink from "./components/HeroShrink.jsx";
import GallerySection from "./components/GallerySection.jsx";
import OnOffSection from "./components/OnOffSection.jsx";
import HelmetsSection from "./components/HelmetsSection.jsx";
import ChampionSection from "./components/ChampionSection.jsx";
import PartnersSection from "./components/PartnersSection.jsx";
import AlbumSection from "./components/AlbumSection.jsx";
import FooterSection from "./components/FooterSection.jsx";
import AnimatedTopo from "./components/AnimatedTopo.jsx";
import Menu from "./components/Menu.jsx";
import {
  LNHalo,
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

      {/* OnOffSection pins to the viewport while HelmetsSection slides up
          over it. Parent is a plain relative box; the sticky child holds
          OnOff in place for the duration of its own height (100vh) of
          scroll, and the next child (HelmetsSection) renders on top thanks
          to its higher z-index and opaque olive background. */}
      <div className="relative">
        <div className="sticky top-0 h-screen z-0">
          <OnOffSection />
        </div>
        <div className="relative z-10">
          <HelmetsSection />
        </div>
      </div>

      {/* ChampionSection and PartnersSection scroll over one shared
          cream+topo background. The sticky child pins to the viewport for
          the duration of the pair's combined height, so what the user sees
          behind ChampionSection's transparent lower half is the SAME
          canvas of contour lines they later see behind PartnersSection —
          no separate topo per section, no visible seam. The
          marginBottom: -100vh trick zeros the sticky child's cost in the
          flow so it doesn't reserve an extra viewport of scroll. */}
      <div className="relative">
        <div
          className="pointer-events-none z-0"
          aria-hidden
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: "100%",
            marginBottom: "-100vh",
            background: "#EFEBDE",
          }}
        >
          <AnimatedTopo
            bg={null}
            lineColor="rgba(120, 130, 90, 0.45)"
            strokeWidth={1.1}
            numBlobs={7}
            numLevels={5}
            levelStart={0.15}
            levelStep={0.32}
          />
        </div>

        <div className="relative z-10">
          <ChampionSection />
          <PartnersSection />
          <AlbumSection />
        </div>
      </div>

      <FooterSection />

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
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 md:top-4 md:gap-0"
          style={{
            opacity: chromeOpacity,
            pointerEvents: chromeOpacity < 0.05 ? "none" : "auto",
          }}
        >
          <LNHalo className="w-20 h-8 md:w-24 md:h-10" />
          <div className="md:hidden flex flex-col items-center gap-1">
            <WordmarkInline />
            <div
              className="text-[9px] tracking-[0.3em] font-bold text-black/75"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              MCLAREN F1 SINCE 2019
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
