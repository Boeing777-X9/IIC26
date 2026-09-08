type Risk = "low" | "moderate" | "high";

const config: Record<Risk, { label: string; bg: string; text: string; dot: string }> = {
  low: { label: "Low Risk", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  moderate: { label: "Moderate Risk", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  high: { label: "High Risk", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

interface Props {
  risk: Risk;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export default function RiskBadge({ risk, size = "md", showDot = true }: Props) {
  const c = config[risk];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-sm px-3 py-1.5 font-semibold" : "text-xs px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${c.bg} ${c.text} ${sizeClass}`}>
      {showDot && <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot}`} />}
      {c.label}
    </span>
  );
}
