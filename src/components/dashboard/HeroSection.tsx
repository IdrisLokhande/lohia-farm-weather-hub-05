import farmHero from "@/assets/farm-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={farmHero}
          alt="Lohia Farm aerial view at golden hour"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[hsl(var(--hero-overlay))]" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 text-center md:py-24">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 animate-pulse-glow rounded-full bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary filter brightness-150">
            Live Monitoring
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-6xl">
          Weather Station: Lohia Farm
        </h1>
        <p className="mt-3 text-lg text-primary-foreground/70">
          Environmental Intelligence System
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
