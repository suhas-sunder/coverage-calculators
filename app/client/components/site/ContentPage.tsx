import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";

type ContentPageProps = {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
  aside?: ReactNode;
};

export default function ContentPage({
  title,
  description,
  path,
  children,
  aside,
}: ContentPageProps) {
  return (
    <main className="bg-slate-50 text-slate-700">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: title, path },
          ]}
        />
        <div className={aside ? "grid gap-10 lg:grid-cols-[1fr_260px]" : ""}>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <header className="border-b border-slate-200 pb-6">
              <h1 className="text-3xl font-bold tracking-tight text-sky-900 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                {description}
              </p>
            </header>
            <div className="content-page-body mt-8 space-y-8">{children}</div>
          </article>
          {aside ? <aside className="min-w-0">{aside}</aside> : null}
        </div>
      </div>
    </main>
  );
}

export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-sky-900 sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 leading-7 text-slate-700">{children}</div>
    </section>
  );
}

