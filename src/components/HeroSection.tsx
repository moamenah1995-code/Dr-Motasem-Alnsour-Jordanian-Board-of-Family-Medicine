import {Calendar, Globe, MessageCircle, Phone, ShieldCheck} from 'lucide-react';
import {useEffect, useState} from 'react';
import {UI_COPY} from '../data/translations';
import type {ConsultationMode, Lang, PageId} from '../types/medical';

interface HeroSectionProps {
  lang: Lang;
  onToggleLang: () => void;
  onNavigate: (page: PageId) => void;
  onStartBooking: (mode?: ConsultationMode) => void;
}

function AnimatedCounter({target, suffix}: {target: number; suffix: string}) {
  const [count, setCount] = useState(target);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCount(target);
      return;
    }

    let frame = 0;
    const totalFrames = 28;
    setCount(0);
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (frame >= totalFrames) {
        window.clearInterval(timer);
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <span className="font-mono-num tabular-nums">
      {count.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

export function HeroSection({lang, onToggleLang, onNavigate, onStartBooking}: HeroSectionProps) {
  const t = UI_COPY[lang];
  const [imgError, setImgError] = useState(false);

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:py-14">
        {/* Clean Institutional Utility Strip with Language Switch */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>{t.hero.credentialsLine}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('reviews')}
              className="cursor-pointer font-medium text-slate-600 hover:text-[#0B3C5D] whitespace-nowrap"
            >
              {t.nav.reviews}
            </button>
            <span aria-hidden="true" className="text-slate-300">
              |
            </span>
            <button
              type="button"
              onClick={onToggleLang}
              className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-[#0B3C5D] hover:text-[#0369A1] whitespace-nowrap"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{t.nav.langSwitch}</span>
            </button>
          </div>
        </div>

        {/* Balanced 2-Column Split Hero */}
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <h1
              className="font-display font-bold tracking-tight text-slate-900"
              style={{
                fontSize: 'clamp(2.1rem, 4vw, 3.45rem)',
                lineHeight: lang === 'ar' ? 1.25 : 1.12,
                textWrap: 'balance',
              }}
            >
              {t.hero.headline}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {t.hero.subheadline}
            </p>

            {/* Primary CTA + Secondary Direct Contact Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => onStartBooking()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0B3C5D] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#082c44] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0369A1]"
              >
                <Calendar className="h-4 w-4" />
                <span>{t.hero.primaryCta}</span>
              </button>

              <a
                href="https://wa.me/962785483349"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-700/30 bg-emerald-50/70 px-5 py-3.5 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-100/70 whitespace-nowrap shrink-0"
              >
                <MessageCircle className="h-4 w-4 text-emerald-700" />
                <span>{t.hero.whatsappCta}</span>
              </a>

              <a
                href="tel:+966570117358"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <Phone className="h-4 w-4 text-[#0B3C5D]" />
                <span>{t.hero.callCta}</span>
              </a>
            </div>

            {/* Institutional Proof Strip */}
            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3 text-xs text-slate-600">
              <div>
                <div className="font-semibold text-slate-900">
                  {lang === 'ar' ? 'مستشفى د. سليمان الحبيب' : 'Dr. Sulaiman Al Habib Hospital'}
                </div>
                <div className="mt-0.5 text-slate-500">
                  {lang === 'ar' ? 'خبرة سريرية — الرياض' : 'Clinical Experience — Riyadh'}
                </div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  {lang === 'ar' ? 'وزارة الصحة الأردنية' : 'Jordanian Ministry of Health'}
                </div>
                <div className="mt-0.5 text-slate-500">
                  {lang === 'ar' ? 'خبرة سابقة في الرعاية الأولية' : 'Primary & Family Care Background'}
                </div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  {lang === 'ar' ? 'استشارات حضورية وعن بعد' : 'In-Clinic & Online Care'}
                </div>
                <div className="mt-0.5 text-slate-500">
                  {lang === 'ar' ? 'السعودية · الأردن · أونلاين' : 'Saudi Arabia · Jordan · Online'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Doctor Portrait Card */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {!imgError ? (
                <img
                  src="/assets/aistudio/___________ecefce18.png"
                  alt={
                    lang === 'ar'
                      ? 'د. معتصم النسور — أخصائي أول طب الأسرة والبورد الأردني'
                      : 'Dr. Motasem Alnsour — Jordanian Board of Family Medicine'
                  }
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] flex-col items-center justify-center bg-slate-100 p-8 text-center">
                  <div className="font-display text-2xl font-bold text-[#0B3C5D]">{t.hero.doctorCaptionTitle}</div>
                  <p className="mt-2 text-sm text-slate-600">{t.hero.doctorCaptionSub}</p>
                </div>
              )}
              <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3.5">
                <div className="font-display text-sm font-bold text-slate-900">{t.hero.doctorCaptionTitle}</div>
                <div className="mt-0.5 text-xs text-slate-600">{t.hero.doctorCaptionSub}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Animated Clinical Statistics Strip */}
        <div className="mt-10 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-4 md:gap-6">
          {t.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col justify-between border-slate-100 md:border-e md:last:border-e-0 md:pe-4">
              <div className="text-2xl font-bold text-[#0B3C5D] sm:text-3xl">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1.5 text-xs font-medium text-slate-600 sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
