import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import logo from "../../assets/images/coverage-calculator-logo-minified.png";

type NavItem = {
  to: string;
  label: string; // full label (large screens)
  short: string; // shorter label (mid screens)
};

const NAV_ITEMS: NavItem[] = [
  {
    to: "/paint-coverage-calculator",
    label: "Paint Coverage Calculator",
    short: "Paint Coverage",
  },
  {
    to: "/mulch-coverage-calculator",
    label: "Mulch Coverage Calculator",
    short: "Mulch Coverage",
  },
  {
    to: "/gravel-coverage-calculator",
    label: "Gravel Coverage Calculator",
    short: "Gravel Coverage",
  },
  {
    to: "/topsoil-coverage-calculator",
    label: "Topsoil Coverage Calculator",
    short: "Topsoil Coverage",
  },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop "More tools" dropdown
  const [moreOpen, setMoreOpen] = useState(false);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  // How many links stay visible on desktop before "More tools"
  const DESKTOP_PRIMARY_COUNT = 3;

  const { primaryItems, overflowItems } = useMemo(() => {
    const primary = NAV_ITEMS.slice(0, DESKTOP_PRIMARY_COUNT);
    const overflow = NAV_ITEMS.slice(DESKTOP_PRIMARY_COUNT);
    return { primaryItems: primary, overflowItems: overflow };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile panel open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Focus first link on mobile open
  useEffect(() => {
    if (!mobileOpen) return;
    setTimeout(() => {
      (firstLinkRef.current ?? closeBtnRef.current)?.focus?.();
    }, 0);
  }, [mobileOpen]);

  // Close on Escape (mobile + dropdown)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMoreOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;

      const btn = moreBtnRef.current;
      const menu = moreMenuRef.current;

      if (btn?.contains(t)) return;
      if (menu?.contains(t)) return;

      setMoreOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [moreOpen]);

  const desktopLinkClass =
    "rounded-lg border border-sky-800/60 bg-sky-900/40 px-3 py-1.5 text-sm font-semibold text-sky-100 hover:bg-sky-800/60 hover:text-white transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-950 whitespace-nowrap";

  const mobileLinkClass =
    "block rounded-xl border border-sky-800/60 bg-sky-900/30 px-4 py-3 text-base font-semibold text-sky-100 hover:bg-sky-800/60 hover:text-white transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-950";

  const dropdownItemClass =
    "block w-full text-left rounded-xl border border-sky-900/50 bg-sky-950/40 px-3 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-900/60 hover:text-white transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-950 whitespace-nowrap";

  const dropdownShellClass =
    "absolute right-0 mt-2 w-72 rounded-2xl border border-sky-900/60 bg-sky-950 shadow-2xl ring-1 ring-black/10 p-2 z-[60]";

  return (
    <header className="bg-sky-950 text-slate-200 border-b border-sky-900/60 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-1">
        <div className="flex items-center justify-between gap-3 py-3">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 cursor-pointer min-w-0"
            aria-label="coveragecalculators home"
          >
            <img
              src={logo}
              alt="coveragecalculators"
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0"
              loading="eager"
              decoding="async"
            />

            {/* Make brand text truncatable */}
            <div className="min-w-0 text-left leading-tight">
              <div className="text-base font-bold text-white tracking-tight group-hover:text-sky-200 truncate">
                CoverageCalculators<span className="text-sky-300">.com</span>
              </div>

              {/* Hide tagline earlier to preserve space */}
              <div className="hidden md:block text-xs text-sky-200 font-semibold truncate">
                Coverage and area calculators
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-3 min-w-0 flex-1 justify-end">
            {/* Scrollable row for the primary links only */}
            <div className="min-w-0 max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-3 justify-end min-w-max">
                {primaryItems.map((it) => (
                  <Link key={it.to} to={it.to} className={desktopLinkClass}>
                    <span className="hidden lg:inline">{it.label}</span>
                    <span className="lg:hidden">{it.short}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Dropdown sits OUTSIDE overflow container so it cannot be clipped */}
            {overflowItems.length > 0 ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  ref={moreBtnRef}
                  className={desktopLinkClass}
                  aria-haspopup="menu"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((v) => !v)}
                >
                  <span className="hidden lg:inline">
                    More tools <span aria-hidden="true">▾</span>
                  </span>
                  <span className="lg:hidden">
                    More <span aria-hidden="true">▾</span>
                  </span>
                </button>

                {moreOpen ? (
                  <div
                    ref={moreMenuRef}
                    role="menu"
                    aria-label="More tools"
                    className={dropdownShellClass}
                  >
                    <div className="px-2 pt-1 pb-2 text-xs font-semibold text-sky-200/90">
                      More calculators
                    </div>

                    <div className="space-y-2">
                      {overflowItems.map((it) => (
                        <Link
                          key={it.to}
                          to={it.to}
                          role="menuitem"
                          className={dropdownItemClass}
                          onClick={() => setMoreOpen(false)}
                        >
                          {it.label}
                        </Link>
                      ))}

                      <Link
                        to="/#all-tools"
                        role="menuitem"
                        className={dropdownItemClass}
                        onClick={() => setMoreOpen(false)}
                      >
                        View all tools <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link to="/#all-tools" className={desktopLinkClass}>
                View all tools <span aria-hidden="true">→</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="sm:hidden shrink-0">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-sky-800/60 bg-sky-900/40 px-3 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-800/60 hover:text-white transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-950"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-haspopup="dialog"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              ref={closeBtnRef}
            >
              <span className="sr-only">
                {mobileOpen ? "Close" : "Open"} menu
              </span>

              {!mobileOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay + panel */}
      {mobileOpen && (
        <div className="sm:hidden">
          {/* Overlay */}
          <button
            type="button"
            className="fixed inset-0 z-40 bg-sky-950/70 backdrop-blur-[2px] cursor-pointer"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed top-0 right-0 z-50 h-full w-[84%] max-w-sm border-l border-sky-900/60 bg-sky-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-sky-900/60 px-4 py-4">
              <div className="text-sm font-bold text-sky-100">Menu</div>
              <button
                type="button"
                className="rounded-lg border border-sky-800/60 bg-sky-900/40 px-3 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-800/60 hover:text-white transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-950"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                Close
              </button>
            </div>

            <nav className="px-4 py-4 space-y-3">
              {NAV_ITEMS.map((it, idx) => (
                <Link
                  key={it.to}
                  to={it.to}
                  ref={idx === 0 ? firstLinkRef : undefined}
                  className={mobileLinkClass}
                >
                  {it.label}
                </Link>
              ))}

              <Link to="/#all-tools" className={mobileLinkClass}>
                View all tools <span aria-hidden="true">→</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
