import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import logo from "../../assets/images/coverage-calculator-logo-minified.png";
import { MAIN_LINKS } from "~/lib/site";

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
  }, [open]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <header className="border-b border-sky-900 bg-sky-950 text-slate-100 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          aria-label="Coverage Calculators home"
        >
          <img
            src={logo}
            alt=""
            width="44"
            height="44"
            className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-bold tracking-tight text-white">
              Coverage Calculators
            </span>
            <span className="hidden text-xs font-medium text-sky-200 md:block">
              Material coverage and quantity tools
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 sm:flex">
          {MAIN_LINKS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={linkClass}
              aria-current={location.pathname === item.path ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-lg border border-sky-800 bg-sky-900 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-sky-900 px-4 py-3 sm:hidden"
        >
          <div className="mx-auto grid max-w-6xl gap-1">
            {MAIN_LINKS.map((item, index) => (
              <Link
                key={item.path}
                ref={index === 0 ? firstLink : undefined}
                to={item.path}
                className={linkClass}
                aria-current={location.pathname === item.path ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/contact" className={linkClass}>
              Contact
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
