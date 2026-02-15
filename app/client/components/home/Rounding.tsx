export default function Rounding({
  roundForDisplay,
  setRoundForDisplay,
  displayDecimals,
  safeDisplayDecimals,
  setDisplayDecimals,
}: {
  roundForDisplay: boolean;
  setRoundForDisplay: (value: boolean) => void;
  displayDecimals: number;
  safeDisplayDecimals: (value: any, fallback: any) => number;
  setDisplayDecimals: (value: any) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 my-4">
      <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 select-none">
        <input
          type="checkbox"
          checked={roundForDisplay}
          onChange={(e) => setRoundForDisplay(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
        />
        Round results for display
      </label>

      <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 select-none">
        <span className="sr-only">Display decimals</span>
        <select
          value={displayDecimals}
          onChange={(e) =>
            setDisplayDecimals(safeDisplayDecimals(e.target.value, 2))
          }
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus-visible:ring-sky-400 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition"
          aria-describedby="display-decimals-help"
          aria-label="Display decimals"
        >
          <option value={0}>0 decimals</option>
          <option value={2}>2 decimals</option>
          <option value={4}>4 decimals</option>
          <option value={6}>6 decimals</option>
        </select>
      </label>

      <span className="sr-only">
        Rounding only affects what you see. Conversions use exact unit
        definitions.
      </span>
    </div>
  );
}
