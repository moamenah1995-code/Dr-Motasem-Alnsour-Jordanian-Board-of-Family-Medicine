import {Mail, MapPin, MessageCircle, Phone} from 'lucide-react';
import {UI_COPY} from '../data/translations';
import type {Lang, PageId} from '../types/medical';

interface FooterProps {
  lang: Lang;
  onNavigate: (page: PageId) => void;
  onToggleLang: () => void;
}

export function Footer({lang, onNavigate, onToggleLang}: FooterProps) {
  const t = UI_COPY[lang];

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-700">
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-display text-xl font-bold text-[#0B3C5D]">{t.brandName}</div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">{t.footer.aboutLine}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span>{lang === 'ar' ? 'البورد الأردني في طب الأسرة' : 'Jordanian Board of Family Medicine'}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'ar' ? 'معتمد لدى SCFHS' : 'SCFHS Certified'}</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onToggleLang}
                className="cursor-pointer font-semibold text-[#0B3C5D] hover:underline"
              >
                {t.nav.langSwitch}
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">{t.footer.quickLinksTitle}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button type="button" onClick={() => onNavigate('about')} className="cursor-pointer hover:text-[#0B3C5D]">
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('family-medicine')} className="cursor-pointer hover:text-[#0B3C5D]">
                  {t.nav.familyMedicine}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services')} className="cursor-pointer hover:text-[#0B3C5D]">
                  {t.nav.services}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('knowledge')} className="cursor-pointer hover:text-[#0B3C5D]">
                  {t.nav.knowledge}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('assessments')} className="cursor-pointer hover:text-[#0B3C5D]">
                  {t.nav.assessments}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('reviews')} className="cursor-pointer hover:text-[#0B3C5D]">
                  {t.nav.reviews}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">{t.footer.contactTitle}</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#0B3C5D]" />
                <a href="tel:+966570117358" dir="ltr" className="font-mono-num hover:text-[#0B3C5D]">
                  +966 57 011 7358
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-emerald-700" />
                <a
                  href="https://wa.me/962785483349"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B3C5D]"
                >
                  {lang === 'ar' ? 'واتساب العيادة المباشر' : 'Direct Clinic WhatsApp'}{' '}
                  <span dir="ltr" className="font-mono-num text-xs text-slate-500">
                    (+962 78 548 3349)
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#0B3C5D]" />
                <a href="mailto:dr.motasem.alnsour@gmail.com" className="break-all hover:text-[#0B3C5D]">
                  dr.motasem.alnsour@gmail.com
                </a>
              </li>
            </ul>

            <h4 className="mt-5 text-xs font-semibold text-slate-900">{t.footer.locationsTitle}</h4>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
              {t.footer.locations.map((loc) => (
                <li key={loc} className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>{loc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>{t.footer.legalNote}</p>
        </div>
      </div>
    </footer>
  );
}
