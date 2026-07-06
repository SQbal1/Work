import { MarketingNav } from "@/components/marketing/MarketingNav";
import { LandingHero } from "@/components/marketing/LandingHero";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { ProductWorkspaceShowcase } from "@/components/marketing/ProductWorkspaceShowcase";
import { HomeMotionRoot } from "@/components/marketing/HomeMotionRoot";
import {
  TrustStrip,
  ProblemSection,
  WorkflowSection,
  BuiltForSection,
  FeatureGridSection,
  EcosystemSection,
  PilotJourneySection,
  PilotSection,
  FaqSection,
  FinalCtaSection,
  MarqueeStrip,
} from "@/components/marketing/HomeSections";

export default function LandingPage() {
  return (
    <HomeMotionRoot>
      <MarketingNav />

      <LandingHero />

      <TrustStrip />

      <ProductWorkspaceShowcase />

      <ProblemSection />
      <MarqueeStrip />
      <WorkflowSection />
      <BuiltForSection />
      <FeatureGridSection />
      <PilotJourneySection />
      <EcosystemSection />
      <PilotSection />
      <FaqSection />
      <FinalCtaSection />

      <MarketingFooter />
    </HomeMotionRoot>
  );
}
