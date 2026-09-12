import React from 'react';
import { LandingHeader } from '../components/landing/LandingHeader';
import { HeroSection } from '../components/landing/HeroSection';
import { PainSection } from '../components/landing/PainSection';
import { OpportunitySection } from '../components/landing/OpportunitySection';
import { AIAgentSection } from '../components/landing/AIAgentSection';
import { CRMSection } from '../components/landing/CRMSection';
import { GoldenFlowSection } from '../components/landing/GoldenFlowSection';
import { VerifiedWorkingSection } from '../components/landing/VerifiedWorkingSection';
import { ProductProofSection } from '../components/landing/ProductProofSection';
import { OneManagerSection } from '../components/landing/OneManagerSection';
import { ScaleSection } from '../components/landing/ScaleSection';
import { AuditOfferSection } from '../components/landing/AuditOfferSection';
import { PricingSection } from '../components/landing/PricingSection';
import { FAQSection } from '../components/landing/FAQSection';
import { FinalCTASection } from '../components/landing/FinalCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white antialiased">
      {/* 1. Sticky Navigation Header */}
      <LandingHeader
        onNavigate={onNavigate}
        onOpenAuditModal={() => scrollTo('audit-offer-section')}
      />

      <main className="flex-1 flex flex-col">
        {/* 2. Hero Section (with Live UI Mockup) */}
        <HeroSection
          onNavigate={onNavigate}
          onScrollToGoldenFlow={() => scrollTo('golden-flow-section')}
          onScrollToAudit={() => scrollTo('audit-offer-section')}
        />

        {/* 3. Pain Points in Traditional Workforce Supply */}
        <PainSection />

        {/* 4. New Opportunity: Shift from Manual to AI OS */}
        <OpportunitySection />

        {/* 5. Specialized 24/7 AI Agents */}
        <AIAgentSection />

        {/* 6. Real-time Internal CRM for Workers & Destinations */}
        <CRMSection />

        {/* 7. Golden Flow 8-stage Blueprint */}
        <GoldenFlowSection />

        {/* 8. Verified Working Worker (VWW) Standard */}
        <VerifiedWorkingSection />

        {/* 9. Operational Reality Proof (No Slide Decks) */}
        <ProductProofSection
          onNavigate={onNavigate}
          onScrollToGoldenFlow={() => scrollTo('golden-flow-section')}
        />

        {/* 10. The One Manager Operating Model */}
        <OneManagerSection />

        {/* 11. Scale By Stage / 6-Stage Roadmap */}
        <ScaleSection />

        {/* 12. Consultation Offer & AI Workforce Blueprint */}
        <AuditOfferSection />

        {/* 13. Solution Levels & Pricing */}
        <PricingSection
          onNavigate={onNavigate}
          onScrollToAudit={() => scrollTo('audit-offer-section')}
        />

        {/* 14. Frequently Asked Questions */}
        <FAQSection />

        {/* 15. Final Conversion Call To Action */}
        <FinalCTASection
          onNavigate={onNavigate}
          onScrollToAudit={() => scrollTo('audit-offer-section')}
        />
      </main>

      {/* 16. Footer */}
      <LandingFooter onNavigate={onNavigate} />
    </div>
  );
};
