import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1628717341663-0007b0ee2597?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwxfHx2b2x1bnRlZXJzJTIwaGVscGluZyUyMGNoaWxkcmVufGVufDB8fHx8MTc4MzUzMDg4MXww&ixlib=rb-4.1.0&q=85",
    label: "Volunteer Drive",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    src: "https://images.pexels.com/photos/18506736/pexels-photo-18506736.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "Classroom Learning",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwyfHxtZWRpY2FsJTIwY2FtcCUyMGRvY3RvcnxlbnwwfHx8fDE3ODM1MzA4ODF8MA&ixlib=rb-4.1.0&q=85",
    label: "Medical Camps",
    span: "",
  },
  {
    src: "https://images.pexels.com/photos/6995301/pexels-photo-6995301.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "Food Drives",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwyfHxwbGFudGluZyUyMHRyZWUlMjBoYW5kc3xlbnwwfHx8fDE3ODM1MzA4ODF8MA&ixlib=rb-4.1.0&q=85",
    label: "Tree Plantation",
    span: "",
  },
  {
    src: "https://images.pexels.com/photos/11490708/pexels-photo-11490708.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "Community Events",
    span: "md:col-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwyfHx2b2x1bnRlZXJzJTIwaGVscGluZyUyMGNoaWxkcmVufGVufDB8fHx8MTc4MzUzMDg4MXww&ixlib=rb-4.1.0&q=85",
    label: "Helping Hands",
    span: "",
  },
];

export default function Gallery() {
  const { t } = useTranslation();
  return (
    <section id="gallery" data-testid="gallery-section" className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">{t("gallery.eyebrow")}</p>
            <h2 className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              {t("gallery.title")}
            </h2>
          </div>
          <p className="font-inter text-slate-600 max-w-md">
            {t("gallery.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[220px] gap-4">
          {IMAGES.map((img, i) => (
            <motion.figure
              key={i}
              data-testid={`gallery-item-${i}`}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-3xl group ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <figcaption className="absolute bottom-4 left-4 right-4 text-white font-poppins font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {img.label}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
