"use client";
import { HeroSection } from "./hero";
import MechanismSection from "./mechanism";
import OursSection from "./ours";
import ValueSection from "./value";

const HomePage: React.FC<{ onSEO: () => void; onAEO: () => void }> = function ({
  onSEO,
  onAEO,
}) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection />

      {/* Section 1: How an AI Agent Works */}
      <MechanismSection />

      {/* Section 2: SEO vs AEO vs GEO */}
      <OursSection onAEO={onAEO} onSEO={onSEO} />

      {/* Section 3: What This Means for Your Website */}
      <ValueSection onAEO={onAEO} onSEO={onSEO} />
    </div>
  );
};

export default HomePage;
