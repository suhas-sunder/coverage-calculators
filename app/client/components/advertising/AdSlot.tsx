import type { ReactNode } from "react";

export type AdPlacement =
  | "top-banner"
  | "sidebar-left"
  | "sidebar-right"
  | "after-utility"
  | "seo-content-square"
  | "all-tools-banner";

type AdSlotProps = {
  placementId: AdPlacement;
  format: "horizontal" | "rectangle" | "square";
  desktopOnly?: boolean;
  minWidth?: number;
  minHeight?: number;
  providerContent?: ReactNode;
};

const showPlaceholder =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_AD_PLACEHOLDERS === "true";

export default function AdSlot({
  placementId,
  format,
  desktopOnly = false,
  minWidth,
  minHeight,
  providerContent,
}: AdSlotProps) {
  if (!providerContent && !showPlaceholder) return null;

  const style = {
    minWidth: minWidth ? `${minWidth}px` : undefined,
    minHeight: minHeight ? `${minHeight}px` : undefined,
  };

  return (
    <aside
      aria-label="Advertisement"
      data-ad-placement={placementId}
      data-ad-format={format}
      className={`ad-slot ${desktopOnly ? "ad-slot--desktop" : ""}`}
      style={style}
    >
      {providerContent ?? (
        <span className="ad-slot__placeholder" aria-hidden="true">
          Advertisement
        </span>
      )}
    </aside>
  );
}

export function CalculatorAdLayout({ children }: { children: ReactNode }) {
  return (
    <div className="calculator-ad-layout">
      <div className="calculator-ad-layout__rail">
        <AdSlot
          placementId="sidebar-left"
          format="rectangle"
          desktopOnly
          minWidth={300}
          minHeight={250}
        />
      </div>
      <div className="min-w-0">{children}</div>
      <div className="calculator-ad-layout__rail">
        <AdSlot
          placementId="sidebar-right"
          format="rectangle"
          desktopOnly
          minWidth={300}
          minHeight={250}
        />
      </div>
    </div>
  );
}
