import { Pill } from "@/components/Pill";
import { ServiceGuide } from "@/types";
import { getGuideFreshness } from "@/utils/guideTrust";

type GuideFreshnessBadgeProps = {
  guide: ServiceGuide;
};

export function GuideFreshnessBadge({ guide }: GuideFreshnessBadgeProps) {
  const freshness = getGuideFreshness(guide);
  return <Pill label={freshness.label} tone={freshness.tone} />;
}
