import {
  Navbar,
  Hero,
  FeatureHighlight,
  BentoGrid,
  StatsSection,
  Footer,
  AppMockup,
  MathMockup,
} from "@/components/landing";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden dark no-scrollbar">
      <Navbar />

      <main>
        {/* Hero includes the dark header and the white video section */}
        <Hero />

        {/* Feature 1 - Dark Theme (Flows from dark bottom of Hero) */}
        <FeatureHighlight
          id="how-it-works"
          title="Extract. Assign. Done."
          description="Simply upload a photo of your receipt. Our AI identifies every line item, price, and modifier. Then, effortlessly assign items to friends with a tap."
          features={[
            "Instant OCR with Gemini 3 Flash",
            "Auto-detection of tax and gratuity",
            "Smart suggestion based on past splits",
          ]}
          imageSrc="/feature.png"
          imageAlt="AI scanning a receipt"
          theme="dark"
          customVisual={<AppMockup />}
          backgroundImage="/feature.png"
        />

        {/* Stats - Dark Theme */}
        <StatsSection />

        {/* Feature 2 - Light Theme */}
        <FeatureHighlight
          title="Fairness, mathematically guaranteed."
          description="We calculate tax and tip proportionally based on the subtotal of items each person claimed. No more overpaying for someone else's expensive drink."
          features={[
            "Proportional tax distribution",
            "Weighted tip calculation",
            "Transparent breakdown for everyone",
          ]}
          imageSrc="/math.png"
          imageAlt="Expense breakdown visualization"
          reversed={true}
          theme="light"
          customVisual={<MathMockup />}
          backgroundImage="/math.png"
        />

        {/* Bento - Dark Theme */}
        <BentoGrid />

        {/* CTA Section - White Theme to transition to Footer */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="font-serif text-5xl md:text-7xl mb-8 text-slate-900">Ready to split that?</h2>
            <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-light">
              Join users who have stopped doing napkin math at dinner.
            </p>
            <Link
              href="/app"
              className="bg-primary hover:bg-primary/90 text-white px-10 py-5 text-lg font-medium transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block"
            >
              Launch Application
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
