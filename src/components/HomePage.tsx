import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Globe,
  MapPin,
  Star,
  Stethoscope,
  Video,
} from 'lucide-react';
import {useEffect, useState} from 'react';
import {HEALTH_ASSESSMENTS} from '../data/assessmentsData';
import {COMMON_MEDICAL_FAQS} from '../data/faqData';
import {KNOWLEDGE_CATEGORIES, MEDICAL_ARTICLES} from '../data/knowledgeData';
import {REVIEW_CRITERIA} from '../data/reviewsData';
import {MEDICAL_SERVICES} from '../data/servicesData';
import {UI_COPY} from '../data/translations';
import type {AssessmentId, ConsultationMode, Lang, PageId, PatientReview} from '../types/medical';
import {FamilyMedicineLifecycleGraphic} from './FamilyMedicineInfographics';
import {HeroSection} from './HeroSection';

interface HomePageProps {
  lang: Lang;
  onToggleLang: () => void;
  onNavigate: (page: PageId) => void;
  onStartBooking: (mode?: ConsultationMode, serviceId?: string) => void;
  onOpenService: (serviceId: string) => void;
  onOpenArticle: (articleId: string) => void;
  onOpenAssessment: (assessmentId: AssessmentId) => void;
  onOpenAiAssistant: () => void;
}

export function HomePage({
  lang,
  onToggleLang,
  onNavigate,
  onStartBooking,
  onOpenService,
  onOpenArticle,
  onOpenAssessment,
  onOpenAiAssistant,
}: HomePageProps) {
  const t = UI_COPY[lang];
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;
  const [liveReviews, setLiveReviews] = useState<PatientReview[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(COMMON_MEDICAL_FAQS[0].id);

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data: {reviews?: PatientReview[]}) => {
        if (Array.isArray(data.reviews)) setLiveReviews(data.reviews);
      })
      .catch(() => {
        // Keep empty array when unavailable
      });
  }, []);

  const featuredServices = [
    MEDICAL_SERVICES[0], // General
    MEDICAL_SERVICES[1], // Chronic
    MEDICAL_SERVICES[3], // Urgent
    MEDICAL_SERVICES[4], // Periodic
    MEDICAL_SERVICES[13], // Remote Telemedicine
    MEDICAL_SERVICES[14], // Filler & Botox
  ];

  const featuredArticles = MEDICAL_ARTICLES.filter((a) => a.featured).slice(0, 3);

  return (
    <div>
      <HeroSection
        lang={lang}
        onToggleLang={onToggleLang}
        onNavigate={onNavigate}
        onStartBooking={(m) => onStartBooking(m)}
      />

      {/* Consultation Modes: Online / Riyadh / Jordan */}
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              {t.appointmentModes.heading}
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">
              {t.appointmentModes.subheading}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Online */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <div>
                <div className="flex items-center justify-between">
                  <Video className="h-5 w-5 text-[#0B3C5D]" />
                  <span className="text-xs font-medium text-emerald-700">{t.appointmentModes.online.meta}</span>
                </div>
                <h3 className="font-display mt-4 text-lg font-bold text-slate-900">
                  {t.appointmentModes.online.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.appointmentModes.online.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onStartBooking('online')}
                className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0B3C5D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#082c44]"
              >
                <span>{t.appointmentModes.online.cta}</span>
                <ArrowIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Riyadh */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <div className="flex items-center justify-between">
                  <MapPin className="h-5 w-5 text-[#0B3C5D]" />
                  <span className="text-xs font-medium text-slate-500">{t.appointmentModes.riyadh.meta}</span>
                </div>
                <h3 className="font-display mt-4 text-lg font-bold text-slate-900">
                  {t.appointmentModes.riyadh.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.appointmentModes.riyadh.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onStartBooking('riyadh')}
                className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <span>{t.appointmentModes.riyadh.cta}</span>
                <ArrowIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Jordan */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <div className="flex items-center justify-between">
                  <Globe className="h-5 w-5 text-[#0B3C5D]" />
                  <span className="text-xs font-medium text-slate-500">{t.appointmentModes.jordan.meta}</span>
                </div>
                <h3 className="font-display mt-4 text-lg font-bold text-slate-900">
                  {t.appointmentModes.jordan.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.appointmentModes.jordan.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onStartBooking('jordan')}
                className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <span>{t.appointmentModes.jordan.cta}</span>
                <ArrowIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Medical Services Asymmetric Grid */}
      <section className="border-b border-slate-200 bg-slate-50/60 py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                {t.homeSections.servicesTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                {t.homeSections.servicesLead}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0B3C5D] hover:text-[#0369A1] whitespace-nowrap shrink-0"
            >
              <span>{t.homeSections.viewAllServices}</span>
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {featuredServices.map((srv, idx) => (
              <article
                key={srv.id}
                className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 ${
                  idx === 0 || idx === 1 ? 'md:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono-num font-bold text-[#0369A1]">{srv.number}</span>
                    <span>{srv.subtitle[lang]}</span>
                  </div>
                  <h3 className="font-display mt-3 text-lg font-bold text-slate-900">{srv.title[lang]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{srv.shortDesc[lang]}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => onOpenService(srv.id)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#0B3C5D] hover:text-[#0369A1]"
                  >
                    <span>{lang === 'ar' ? 'التفاصيل' : 'Details'}</span>
                    <ArrowIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartBooking(srv.modes[0], srv.id)}
                    className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    {lang === 'ar' ? 'احجز' : 'Book'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What is Family Medicine Interactive Preview */}
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                {t.homeSections.familyMedTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                {t.homeSections.familyMedLead}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('family-medicine')}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0B3C5D] hover:text-[#0369A1] whitespace-nowrap shrink-0"
            >
              <span>{t.homeSections.exploreFamilyMed}</span>
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>

          <FamilyMedicineLifecycleGraphic lang={lang} />
        </div>
      </section>

      {/* Interactive Health Assessments + AI Medical Assistant Callout */}
      <section className="border-b border-slate-200 bg-slate-50/60 py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                {t.homeSections.assessmentsTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                {t.homeSections.assessmentsLead}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('assessments')}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0B3C5D] hover:text-[#0369A1] whitespace-nowrap shrink-0"
            >
              <span>{t.homeSections.viewAllAssessments}</span>
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HEALTH_ASSESSMENTS.map((test, idx) => (
              <button
                key={test.id}
                type="button"
                onClick={() => onOpenAssessment(test.id)}
                className="flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-start transition-colors hover:border-[#0369A1]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono-num font-semibold text-[#0369A1]">0{idx + 1}</span>
                    <ClipboardCheck className="h-4 w-4 text-slate-400" />
                  </div>
                  <h3 className="font-display mt-2.5 text-base font-bold text-slate-900">{test.title[lang]}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{test.shortDesc[lang]}</p>
                </div>
                <div className="mt-4 text-xs font-semibold text-[#0B3C5D]">
                  {lang === 'ar' ? 'ابدأ الاختبار ←' : 'Start Assessment →'}
                </div>
              </button>
            ))}
          </div>

          {/* AI Medical Assistant Institutional Banner */}
          <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-[#0B3C5D] p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-200">
                <Stethoscope className="h-4 w-4" />
                <span>
                  {lang === 'ar'
                    ? 'إرشاد صحي ذكي مرتبط بخدمات ومقالات العيادة'
                    : 'Smart Health Navigation Connected to Clinic Services & Library'}
                </span>
              </div>
              <h3 className="font-display mt-2 text-xl font-bold">
                {lang === 'ar'
                  ? 'هل لديك استفسار صحي أو تحتاج لتحديد الفحص والخدمة الأنسب؟'
                  : 'Have a Health Question or Unsure Which Service or Screening You Need?'}
              </h3>
              <p className="mt-1.5 text-sm text-sky-100">
                {lang === 'ar'
                  ? 'تحدث مع المساعد الطبي الذكي للحصول على توعية عامة موثوقة واقتراحات للمقالات وحجز الموعد المناسب.'
                  : 'Ask our AI Medical Assistant for reliable educational guidance, tailored article links, and booking navigation.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="cursor-pointer rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#0B3C5D] hover:bg-sky-50 whitespace-nowrap shrink-0"
            >
              {lang === 'ar' ? 'استشر المساعد الذكي' : 'Open AI Medical Assistant'}
            </button>
          </div>
        </div>
      </section>

      {/* Medical Knowledge Center Preview */}
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                {t.homeSections.knowledgeTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                {t.homeSections.knowledgeLead}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('knowledge')}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0B3C5D] hover:text-[#0369A1] whitespace-nowrap shrink-0"
            >
              <span>{t.homeSections.viewAllKnowledge}</span>
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {featuredArticles.map((art) => {
              const cat = KNOWLEDGE_CATEGORIES.find((c) => c.id === art.categoryId);
              return (
                <article
                  key={art.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <BookOpen className="h-3.5 w-3.5 text-[#0369A1]" />
                      <span>{cat?.name[lang]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">
                        {art.readTimeMinutes} {lang === 'ar' ? 'د' : 'min'}
                      </span>
                    </div>
                    <h3 className="font-display mt-3 text-base font-bold text-slate-900">{art.title[lang]}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{art.summary[lang]}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenArticle(art.id)}
                    className="mt-5 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#0B3C5D] hover:text-[#0369A1]"
                  >
                    <span>{lang === 'ar' ? 'قراءة المقال' : 'Read Article'}</span>
                    <ArrowIcon className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Patient Testimonials Preview (Claim-to-Proof Adjacent) */}
      <section className="bg-slate-50/60 py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                {t.homeSections.reviewsTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                {t.homeSections.reviewsLead}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reviews')}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0B3C5D] hover:text-[#0369A1] whitespace-nowrap shrink-0"
            >
              <span>{t.homeSections.viewAllReviews}</span>
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>

          {liveReviews.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {liveReviews.slice(0, 3).map((rev) => (
                <article key={rev.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 font-mono-num font-bold text-slate-900">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {rev.rating.toFixed(1)} / 5.0
                      </span>
                      <span className="font-mono-num text-slate-500">{rev.visitDate || rev.date}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">“{rev.comment[lang]}”</p>
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-3.5 text-xs">
                    <div className="font-bold text-slate-900">{rev.patientName[lang]}</div>
                    <div className="text-slate-500">
                      {rev.location[lang]} · {rev.serviceName[lang]}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {REVIEW_CRITERIA.map((crit, idx) => (
                <div key={crit.key} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="font-mono-num text-xs font-bold text-[#0369A1]">0{idx + 1}</div>
                  <h3 className="font-display mt-2 text-sm font-bold text-slate-900">{crit.label[lang]}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{crit.description[lang]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Common Medical Questions (Synced with Schema.org FAQPage) */}
      <section className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-[#0369A1]">
              {lang === 'ar' ? 'الأسئلة الطبية الشائعة' : 'Common Medical Questions'}
            </div>
            <h2 className="font-display mt-1.5 text-2xl font-bold text-slate-900 sm:text-3xl">
              {lang === 'ar' ? 'إجابات موثوقة حول طب الأسرة والحجز والمتابعة' : 'Frequently Asked Questions About Family Medicine & Visits'}
            </h2>
          </div>

          <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/40">
            {COMMON_MEDICAL_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-start text-sm font-bold text-slate-900 hover:bg-slate-50 sm:text-base"
                  >
                    <span>{faq.question[lang]}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{faq.answer[lang]}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
