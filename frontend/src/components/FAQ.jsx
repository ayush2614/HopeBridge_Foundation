import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How can I volunteer with HopeBridge Foundation?",
    a: "Fill out the volunteer form on this page. Our team reviews applications weekly and will get in touch within 3–5 business days with role options that fit your skills and availability.",
  },
  {
    q: "Are my donations tax-deductible?",
    a: "Yes. HopeBridge is a registered nonprofit under Section 12A. All donations from Indian residents are eligible for 80G tax exemption. A certificate is emailed to you within 7 days of your donation.",
  },
  {
    q: "How do you ensure transparency and accountability?",
    a: "We publish annual impact reports, audited financial statements, and program-wise expense breakdowns on our website. Independent auditors review our books every year.",
  },
  {
    q: "Can I donate in currencies other than INR?",
    a: "Currently, our Stripe-powered donation flow accepts INR. For international donations, please contact us at donate@hopebridge.org and we'll share options.",
  },
  {
    q: "Can my company partner with HopeBridge for CSR?",
    a: "Absolutely. We work with companies to design meaningful CSR programs across education, healthcare and environment. Reach out via the contact form to explore a partnership.",
  },
  {
    q: "Where do you currently operate?",
    a: "We're active across 50+ villages and 8 urban centers spanning Maharashtra, Delhi NCR, Bihar, Odisha and Karnataka, with growing chapters in Tamil Nadu and West Bengal.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" data-testid="faq-section" className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">FAQ</p>
          <h2 className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Questions, answered.</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4" data-testid="faq-accordion">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              data-testid={`faq-item-${i}`}
              className="bg-white rounded-2xl border border-slate-100 px-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
            >
              <AccordionTrigger className="text-left font-poppins font-semibold text-slate-900 py-5 hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 font-inter leading-relaxed pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
