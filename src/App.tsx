import {useEffect, useState} from 'react';
import {AboutDoctorPage} from './components/AboutDoctorPage';
import {AiAssistantDrawer} from './components/AiAssistantDrawer';
import {BookingPage} from './components/BookingPage';
import {FamilyMedicinePage} from './components/FamilyMedicineInfographics';
import {Footer} from './components/Footer';
import {Header} from './components/Header';
import {HealthAssessmentsPage} from './components/HealthAssessmentsPage';
import {HomePage} from './components/HomePage';
import {KnowledgeCenterPage} from './components/KnowledgeCenterPage';
import {ReviewsPage} from './components/ReviewsPage';
import {ServicesPage} from './components/ServicesPage';
import {COMMON_MEDICAL_FAQS} from './data/faqData';
import type {AssessmentId, ConsultationMode, Lang, PageId} from './types/medical';

export default function App() {
  const [lang, setLang] = useState<Lang>('ar');
  const [activePage, setActivePage] = useState<PageId>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<AssessmentId | null>(null);
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<ConsultationMode | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  // Sync document direction, language, and SEO title cleanly
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    const pageTitles: Record<PageId, {ar: string; en: string}> = {
      home: {
        ar: 'د. معتصم النسور | أخصائي أول طب الأسرة — الرياض والأردن',
        en: 'Dr. Motasem Alnsour | Senior Specialist in Family Medicine',
      },
      about: {
        ar: 'عن الدكتور معتصم النسور | السيرة الذاتية والمؤهلات',
        en: 'About Dr. Motasem Alnsour | Credentials & Experience',
      },
      'family-medicine': {
        ar: 'ما هو طب الأسرة؟ | دليل العائلة الطبي — د. معتصم النسور',
        en: 'What Is Family Medicine? | Patient Guide — Dr. Motasem Alnsour',
      },
      services: {
        ar: 'الخدمات الطبية (15 خدمة) | د. معتصم النسور',
        en: 'Medical Services (15 Services) | Dr. Motasem Alnsour',
      },
      knowledge: {
        ar: 'مركز المعرفة الطبية والمدونة الذكية | د. معتصم النسور',
        en: 'Medical Knowledge Center & Blog | Dr. Motasem Alnsour',
      },
      assessments: {
        ar: 'اختبارات صحية تفاعلية | د. معتصم النسور',
        en: 'Interactive Health Assessments | Dr. Motasem Alnsour',
      },
      booking: {
        ar: 'حجز موعد (أونلاين · الرياض · الأردن) | د. معتصم النسور',
        en: 'Book Appointment (Online · Riyadh · Jordan) | Dr. Motasem Alnsour',
      },
      reviews: {
        ar: 'آراء المرضى والشهادات | د. معتصم النسور',
        en: 'Patient Reviews & Testimonials | Dr. Motasem Alnsour',
      },
    };
    document.title = pageTitles[activePage][lang];

    // Keep canonical URL synced
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Keep Schema.org FAQPage JSON-LD synced with active language
    const faqScript = document.getElementById('faq-schema-jsonld');
    if (faqScript) {
      faqScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: COMMON_MEDICAL_FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question[lang],
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer[lang],
          },
        })),
      });
    }
  }, [lang, activePage]);

  const navigateTo = (page: PageId) => {
    setActivePage(page);
    if (page !== 'services') setSelectedServiceId(null);
    if (page !== 'knowledge') setSelectedArticleId(null);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleOpenService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setActivePage('services');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleOpenArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    setActivePage('knowledge');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleOpenAssessment = (assessmentId: AssessmentId) => {
    setSelectedAssessmentId(assessmentId);
    setActivePage('assessments');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleStartBooking = (mode?: ConsultationMode, serviceId?: string) => {
    setBookingMode(mode ?? null);
    setBookingServiceId(serviceId ?? null);
    setActivePage('booking');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const toggleLang = () => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header lang={lang} activePage={activePage} onNavigate={navigateTo} onToggleLang={toggleLang} />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            lang={lang}
            onToggleLang={toggleLang}
            onNavigate={navigateTo}
            onStartBooking={handleStartBooking}
            onOpenService={handleOpenService}
            onOpenArticle={handleOpenArticle}
            onOpenAssessment={handleOpenAssessment}
            onOpenAiAssistant={() => setAiOpen(true)}
          />
        )}

        {activePage === 'about' && <AboutDoctorPage lang={lang} onNavigate={navigateTo} />}

        {activePage === 'family-medicine' && <FamilyMedicinePage lang={lang} onNavigate={navigateTo} />}

        {activePage === 'services' && (
          <ServicesPage
            lang={lang}
            selectedServiceId={selectedServiceId}
            onSelectService={setSelectedServiceId}
            onBookService={(serviceId, mode) => handleStartBooking(mode, serviceId)}
          />
        )}

        {activePage === 'knowledge' && (
          <KnowledgeCenterPage
            lang={lang}
            selectedArticleId={selectedArticleId}
            onSelectArticle={setSelectedArticleId}
            onBookService={(serviceId) => handleStartBooking(undefined, serviceId)}
            onOpenService={handleOpenService}
          />
        )}

        {activePage === 'assessments' && (
          <HealthAssessmentsPage
            lang={lang}
            initialAssessmentId={selectedAssessmentId}
            onOpenArticle={handleOpenArticle}
            onBookService={(serviceId) => handleStartBooking(undefined, serviceId)}
          />
        )}

        {activePage === 'booking' && (
          <BookingPage lang={lang} initialServiceId={bookingServiceId} initialMode={bookingMode} />
        )}

        {activePage === 'reviews' && (
          <ReviewsPage lang={lang} onStartBooking={() => handleStartBooking()} />
        )}
      </main>

      <Footer lang={lang} onNavigate={navigateTo} onToggleLang={toggleLang} />

      <AiAssistantDrawer
        lang={lang}
        isOpen={aiOpen}
        onOpen={() => setAiOpen(true)}
        onClose={() => setAiOpen(false)}
        onOpenService={handleOpenService}
        onOpenArticle={handleOpenArticle}
        onBookService={(serviceId, mode) => handleStartBooking(mode, serviceId)}
      />
    </div>
  );
}
