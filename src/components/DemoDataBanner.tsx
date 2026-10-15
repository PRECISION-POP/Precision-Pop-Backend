import { FlaskConical } from "lucide-react";

/**
 * Displayed on every dashboard that renders illustrative figures so a demo
 * can never be mistaken for live performance data.
 */
export const DemoDataBanner = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 ${className}`}
    role="note"
    aria-label="Demonstration data notice"
  >
    <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
    <p className="text-sm">
      <strong className="font-semibold">Demonstration data.</strong> Figures on
      this screen are illustrative placeholders for the demo, not live campaign
      results.
    </p>
  </div>
);

export default DemoDataBanner;
