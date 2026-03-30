import TopBanner from "@/app/@unauthenticated/Components/HomePage/Sections/TopBanner";
import FooterSection from "@/app/@unauthenticated/Components/HomePage/Sections/FooterSection";
import FeatureHighlights from "./Sections/FeatureHighlights";
import PricingPlansSection from "./Sections/PricingPlansSection";
import StatsStrip from "./Sections/StatsStrip";
import StepsSection from "./Sections/StepsSection";
import AboutSection from "./Sections/AboutSection";
import TestimonialSection from "./Sections/TestimonialSection";
import CTASection from "./Sections/CTASection";

export default function UnauthenticatedHome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <TopBanner />
        <FeatureHighlights />
        <PricingPlansSection />
        <StatsStrip />
        <StepsSection />
        <AboutSection />
        <TestimonialSection />
        <CTASection />
        <FooterSection />
      </main>
    </div>
  );
}
