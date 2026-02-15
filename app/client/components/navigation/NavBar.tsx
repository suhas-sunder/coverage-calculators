import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import logo from "../../assets/images/coverage-calculator-logo-minified.png";

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when open (mobile)
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Focus management when opening
  useEffect(() => {
    if (!mobileOpen) return;
    setTimeout(() => {
      (firstLinkRef.current ?? closeBtnRef.current)?.focus?.();
    }, 0);
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const desktopLinkClass =
    "rounded-lg border border-sky-800/60 bg-sky-900/40 px-3 py-1.5 text-sm font-semibold text-sky-100 hover:bg-sky-800/60 hover:text-white transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-950";

  const mobileLinkClass =
    "block rounded-xl border border-sky-800/60 bg-sky-900/30 px-4 py-3 text-base font-semibold text-sky-100 hover:bg-sky-800/60 hover:text-white transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-950";

  return (
    <header className="bg-sky-950 text-slate-200 border-b border-sky-900/60 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-1">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 cursor-pointer"
            aria-label="coveragecalculators home"
          >
            <img
              src={logo}
              alt="coveragecalculators"
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
              loading="eager"
              decoding="async"
            />
            <div className="text-left leading-tight">
              <div className="text-base font-bold text-white tracking-tight group-hover:text-sky-200">
                CoverageCalculators<span className="text-sky-300">.com</span>
              </div>
              <div className="text-xs text-sky-200 font-semibold">
                Coverage and area calculators
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-3">
            <Link to="/paint-coverage-calculator" className={desktopLinkClass}>
              Paint Coverage Calculator
            </Link>
            <Link to="/mulch-coverage-calculator" className={desktopLinkClass}>
              Mulch Coverage Calculator
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="sm:hidden">
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
              <Link
                to="/paint-coverage-calculator"
                ref={firstLinkRef}
                className={mobileLinkClass}
              >
                Paint Coverage Calculator
              </Link>

              <Link to="/mulch-coverage-calculator" className={mobileLinkClass}>
                Mulch Coverage Calculator
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
