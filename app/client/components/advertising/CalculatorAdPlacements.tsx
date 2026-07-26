import AdSlot from "./AdSlot";
import { EstimateNote } from "../site/CalculatorTrust";

export function CalculatorTopBanner() {
  return (
    <AdSlot
      placementId="top-banner"
      format="horizontal"
      minHeight={90}
    />
  );
}

export function CalculatorAfterUtility() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <EstimateNote />
      <AdSlot
        placementId="after-utility"
        format="horizontal"
        minHeight={90}
      />
    </div>
  );
}

export function CalculatorSeoContentAd() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <AdSlot
        placementId="seo-content-square"
        format="square"
        minHeight={250}
      />
    </div>
  );
}

export function CalculatorAllToolsAd() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <AdSlot
        placementId="all-tools-banner"
        format="horizontal"
        minHeight={90}
      />
    </div>
  );
}

