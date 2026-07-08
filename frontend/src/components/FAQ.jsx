import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QKEYS = ["q1", "q2", "q3", "q4", "q5", "q6"];

export default function FAQ() {
  const { t } = useTranslation();
  return (
    <section id="faq" data-testid="faq-section" className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">{t("faq.eyebrow")}</p>
          <h2 className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">{t("faq.title")}</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4" data-testid="faq-accordion">
          {QKEYS.map((qk, i) => (
            <AccordionItem
              key={qk}
              value={`item-${i}`}
              data-testid={`faq-item-${i}`}
              className="bg-white rounded-2xl border border-slate-100 px-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
            >
              <AccordionTrigger className="text-left font-poppins font-semibold text-slate-900 py-5 hover:no-underline">
                {t(`faq.${qk}`)}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 font-inter leading-relaxed pb-5">
                {t(`faq.${qk.replace("q", "a")}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
