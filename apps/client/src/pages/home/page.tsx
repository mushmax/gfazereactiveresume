import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Helmet } from "react-helmet-async";

import { FeaturesSection } from "./sections/features";
import { HeroSection } from "./sections/hero";
import { TemplatesSection } from "./sections/templates";

export const HomePage = () => {
  const { i18n } = useLingui();

  return (
    <main className="relative isolate bg-background">
      <Helmet prioritizeSeoTags>
        <html lang={i18n.locale} />

        <title>
          {t`GFAZE Resume - Powered by GigaFaze`} - {t`AI Powered Resume Builder`}
        </title>

        <meta
          name="description"
          content="GFAZE Resume is the most versatile AI Powered Resume Builder offered by GigaFaze to help you land your next dream Job."
        />
      </Helmet>

      <HeroSection />
      <FeaturesSection />
      <TemplatesSection />
      {/* Removed sections for cleaner design matching reference */}
      {/* <LogoCloudSection /> */}
      {/* <StatisticsSection /> */}
      {/* <TestimonialsSection /> */}
      {/* <SupportSection /> */}
      {/* <FAQSection /> */}
      {/* <ContributorsSection /> */}
    </main>
  );
};
