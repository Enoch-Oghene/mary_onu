import { useEffect, useState } from "react";
import HeroShrink from "./components/HeroShrink.jsx";
import SharedBackground from "./components/SharedBackground.jsx";
import GallerySection from "./components/GallerySection.jsx";
import OnOffSection from "./components/OnOffSection.jsx";
import LifeTributeSection from "./components/LifeTributeSection.jsx";
import MemoriesSection from "./components/MemoriesSection.jsx";
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
  // Retuned for the sensitive 140vh shrink container: the whole shrink runs
  // in ~40vh of scroll, so the chrome fade sits inside the first ~28vh —
  // fully visible ≤ 15vh, gone by 28vh, tracking the shrink 1:1.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const op = Math.max(0, Math.min(1, (0.28 * vh - y) / (0.13 * vh)));
      setChromeOpacity(op);
      setScrolled(y > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock/unlock page scrolling when the tap-to-lock toggle is engaged.
  // body overflow:hidden is enough on desktop, but on mobile browsers the
  // touch scroller ignores it — we also need a non-passive touchmove
  // listener that calls preventDefault(). Wheel is covered for trackpads
  // and mice. Other listeners (e.g. the topo's ripple/blurb touchmove) are
  // unaffected: they still receive the event, we just win the scroll race.
  useEffect(() => {
    if (!locked) return;
    const prevent = (e) => e.preventDefault();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("touchmove", prevent, { passive: false });
    window.addEventListener("wheel", prevent, { passive: false });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("touchmove", prevent);
      window.removeEventListener("wheel", prevent);
    };
  }, [locked]);

  return (
    // OUTER — full browser viewport, cream surround. Anything outside the
    // 430px mobile column (on desktop / tablet) shows this cream. Note
    // that SharedBackground below is `position: fixed` and covers the
    // whole browser too — so the topo/cream aesthetic extends edge-to-
    // edge on desktop, with the mobile content column floating in the
    // middle of it. Chrome (GIVE, menu button, TapToLock) also stays
    // fixed to the browser viewport corners — instead of trying to pin
    // them to the mobile column, we let them behave like normal web-app
    // chrome (Instagram-web-style). Always accessible on scroll.
    <div
      style={{
        background: "#EFEBDE",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* INNER — the mobile content column. Capped at 430px wide (widest
          common phone) and centred. No transform: keeping fixed
          descendants viewport-relative so they don't scroll away. */}
      <div
        className="w-full"
        style={{
          maxWidth: "430px",
          margin: "0 auto",
          minHeight: "100vh",
          position: "relative",
          background: "#EFEBDE",
        }}
      >
        {/* Static background for all post-hero sections. Position:fixed so
            it never scrolls; DOM-ordered before <HeroShrink /> so the hero's
            own opaque stack paints on top of it during hero scroll. */}
        <SharedBackground />
        <HeroShrink />
        <GallerySection />
        <OnOffSection />
        <LifeTributeSection />
        <MemoriesSection />

        {/* ============= MENU OVERLAY ============= */}
        <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* ============= CHROME =============
            Note: all `md:*` classes below are inert — the site is mobile-
            only via tailwind.config.js. Kept as dead code for now to
            avoid a sweeping refactor; they simply never activate. */}
        {/* Store — top-left on mobile */}
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

        {/* Desktop wordmark top-left — inert (md: disabled) */}
        {!menuOpen && (
          <div
            className="fixed top-5 left-6 z-40 hidden md:block"
            style={{ opacity: chromeOpacity }}
          >
            <Wordmark />
          </div>
        )}

        {/* Top-centre wordmark stack (mobile).
            Smoothly fades over the shrink scroll. */}
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

        {/* Next Race — desktop only (inert) */}
        {!menuOpen && !scrolled && (
          <div className="hidden md:block">
            <NextRaceCard race="BAKU GP" />
          </div>
        )}

        {/* Tap-to-lock — mobile, only at rest */}
        {!menuOpen && !scrolled && (
          <div className="fixed bottom-4 right-4 z-50 md:hidden">
            <TapToLock locked={locked} onToggle={() => setLocked((v) => !v)} />
          </div>
        )}
      </div>
    </div>
  );
}
