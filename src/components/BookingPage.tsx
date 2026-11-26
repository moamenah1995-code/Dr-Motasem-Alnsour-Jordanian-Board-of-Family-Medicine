import {CalendarCheck, CheckCircle2, Clock, Globe, Mail, MapPin, MessageCircle, Video} from 'lucide-react';
import {useEffect, useMemo, useState, type FormEvent} from 'react';
import {MEDICAL_SERVICES} from '../data/servicesData';
import type {AppointmentConfirmation, ConsultationMode, Lang} from '../types/medical';

interface BookingPageProps {
  lang: Lang;
  initialServiceId?: string | null;
  initialMode?: ConsultationMode | null;
}

interface SlotAvailability {
  time: string;
  available: boolean;
}

function getUpcomingDates(days = 10): string[] {
  const result: string[] = [];
  const today = new Date();
  for (let i = 1; i <= days; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

export function BookingPage({lang, initialServiceId, initialMode}: BookingPageProps) {
  const upcomingDates = useMemo(() => getUpcomingDates(10), []);

  const [mode, setMode] = useState<ConsultationMode>(initialMode ?? 'online');
  const [serviceId, setServiceId] = useState<string>(initialServiceId ?? MEDICAL_SERVICES[0].id);
  const [date, setDate] = useState<string>(upcomingDates[0]);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmation, setConfirmation] = useState<AppointmentConfirmation | null>(null);

  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
  }, [initialServiceId]);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setErrorMsg('');

    fetch(`/api/appointments/availability?mode=${encodeURIComponent(mode)}&date=${encodeURIComponent(date)}`)
      .then((res) => res.json())
      .then((data: {slots?: SlotAvailability[]; error?: string}) => {
        if (cancelled) return;
        const fetched = Array.isArray(data.slots) ? data.slots : [];
        setSlots(fetched);
        const firstAvailable = fetched.find((s) => s.available)?.time ?? '';
        setTimeSlot(firstAvailable);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setErrorMsg(lang === 'ar' ? 'تعذر تحميل المواعيد المتاحة.' : 'Unable to load available time slots.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, date, lang]);

  const selectedService = MEDICAL_SERVICES.find((s) => s.id === serviceId) ?? MEDICAL_SERVICES[0];

  const modeMeta: Record<
    ConsultationMode,
    {title: {ar: string; en: string}; subtitle: {ar: string; en: string}; tz: {ar: string; en: string}}
  > = {
    online: {
      title: {ar: 'استشارة أونلاين (عن بعد)', en: 'Online Telehealth'},
      subtitle: {ar: 'استشارة مرئية أو صوتية آمنة من أي مكان', en: 'Secure video or audio from anywhere'},
      tz: {ar: 'بتوقيت السعودية والأردن (GMT+3)', en: 'KSA & Jordan Time (GMT+3)'},
    },
    riyadh: {
      title: {ar: 'حضوري — الرياض (السعودية)', en: 'In-Clinic — Riyadh, KSA'},
      subtitle: {ar: 'زيارة سريرية مباشرة في عيادة الرياض', en: 'Direct clinical visit in Riyadh'},
      tz: {ar: 'بتوقيت الرياض (AST)', en: 'Riyadh Time (AST)'},
    },
    jordan: {
      title: {ar: 'حضوري — عمّان (الأردن)', en: 'In-Clinic — Amman, Jordan'},
      subtitle: {ar: 'زيارة سريرية مباشرة في عيادة الأردن', en: 'Direct clinical visit in Jordan'},
      tz: {ar: 'بتوقيت عمّان (GMT+3)', en: 'Amman Time (GMT+3)'},
    },
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!timeSlot) {
      setErrorMsg(lang === 'ar' ? 'يرجى اختيار وقت الموعد.' : 'Please choose an available time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          mode,
          serviceId,
          date,
          timeSlot,
          patientName,
          phone,
          email,
          notes,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || (lang === 'ar' ? 'يرجى التحقق من البيانات المدخلة.' : 'Please verify your booking details.'));
        return;
      }
      setConfirmation(data as AppointmentConfirmation);
    } catch {
      setErrorMsg(lang === 'ar' ? 'حدث خطأ في الاتصال بالخادم.' : 'Network error submitting appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    const fullPatientDetailsAr = [
      `طلب حجز موعد جديد — د. معتصم النسور`,
      `الرقم المرجعي: ${confirmation.referenceCode}`,
      `نوع الاستشارة: ${modeMeta[confirmation.mode].title.ar}`,
      `الخدمة الطبية: ${selectedService.title.ar}`,
      `التاريخ والوقت: ${confirmation.date} الساعة ${confirmation.timeSlot}`,
      `اسم المريض: ${confirmation.patientName}`,
      `رقم الجوال/واتساب: ${confirmation.phone}`,
      `البريد الإلكتروني: ${confirmation.email || 'غير متوفر'}`,
      `ملاحظات المريض: ${confirmation.notes || 'لا يوجد'}`,
    ].join('\n');

    const fullPatientDetailsEn = [
      `New Appointment Request — Dr. Motasem Alnsour`,
      `Reference Code: ${confirmation.referenceCode}`,
      `Consultation Mode: ${modeMeta[confirmation.mode].title.en}`,
      `Medical Service: ${selectedService.title.en}`,
      `Date & Time: ${confirmation.date} at ${confirmation.timeSlot}`,
      `Patient Name: ${confirmation.patientName}`,
      `Phone / WhatsApp: ${confirmation.phone}`,
      `Patient Email: ${confirmation.email || 'Not provided'}`,
      `Clinical Notes: ${confirmation.notes || 'None'}`,
    ].join('\n');

    const summaryText = lang === 'ar' ? fullPatientDetailsAr : fullPatientDetailsEn;
    const whatsappMessage = encodeURIComponent(summaryText);
    const mailSubject = encodeURIComponent(
      `[Booking ${confirmation.referenceCode}] ${confirmation.patientName} - ${confirmation.date} ${confirmation.timeSlot}`
    );
    const mailBody = encodeURIComponent(summaryText);

    return (
      <div className="mx-auto max-w-[820px] px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-xs">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {lang === 'ar' ? 'تم تسجيل طلب الحجز بنجاح' : 'Appointment Request Registered'}
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {lang === 'ar'
              ? 'يمكنك الآن إرسال نسخة فورية من بيانات الحجز إلى واتساب العيادة (+962785483349) والبريد الإلكتروني للطبيب (dr.motasem.alnsour@gmail.com).'
              : 'Send your complete booking details immediately to the clinic WhatsApp (+962785483349) and Dr. Motasem’s email (dr.motasem.alnsour@gmail.com).'}
          </p>

          {/* Delivery Status Summary */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
              <span className="font-semibold text-slate-800">
                {lang === 'ar' ? 'البريد الإلكتروني للعيادة:' : 'Clinic Email:'}{' '}
              </span>
              <span className={confirmation.emailDispatched ? 'font-semibold text-emerald-700' : 'text-slate-600'}>
                {confirmation.emailDispatched
                  ? lang === 'ar'
                    ? 'تم الإرسال تلقائياً إلى dr.motasem.alnsour@gmail.com'
                    : 'Automatically sent to dr.motasem.alnsour@gmail.com'
                  : lang === 'ar'
                    ? 'جاهز للإرسال بضغطة واحدة عبر زر البريد أدناه'
                    : 'Ready to send via Email button below'}
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
              <span className="font-semibold text-slate-800">
                {lang === 'ar' ? 'واتساب العيادة:' : 'Clinic WhatsApp:'}{' '}
              </span>
              <span className={confirmation.whatsappDispatched ? 'font-semibold text-emerald-700' : 'text-slate-600'}>
                {confirmation.whatsappDispatched
                  ? lang === 'ar'
                    ? 'تم الإرسال تلقائياً إلى 962785483349'
                    : 'Automatically sent to 962785483349'
                  : lang === 'ar'
                    ? 'جاهز للإرسال المباشر إلى 962785483349 أدناه'
                    : 'Ready for instant WhatsApp dispatch to 962785483349 below'}
              </span>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50 px-5 text-sm">
            <div className="flex items-center justify-between py-3">
              <dt className="text-slate-500">{lang === 'ar' ? 'الرقم المرجعي' : 'Reference Code'}</dt>
              <dd className="font-mono-num font-bold text-[#0B3C5D]">{confirmation.referenceCode}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-slate-500">{lang === 'ar' ? 'نوع الاستشارة والموقع' : 'Consultation Mode'}</dt>
              <dd className="font-semibold text-slate-900">{modeMeta[confirmation.mode].title[lang]}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-slate-500">{lang === 'ar' ? 'الخدمة الطبية' : 'Medical Service'}</dt>
              <dd className="font-semibold text-slate-900">{selectedService.title[lang]}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-slate-500">{lang === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</dt>
              <dd className="font-mono-num font-semibold text-slate-900">
                {confirmation.date} · {confirmation.timeSlot}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-slate-500">{lang === 'ar' ? 'اسم المريض' : 'Patient Name'}</dt>
              <dd className="font-semibold text-slate-900">{confirmation.patientName}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-slate-500">{lang === 'ar' ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}</dt>
              <dd dir="ltr" className="font-mono-num font-semibold text-slate-900">
                {confirmation.phone}
              </dd>
            </div>
            {confirmation.email && (
              <div className="flex items-center justify-between py-3">
                <dt className="text-slate-500">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</dt>
                <dd dir="ltr" className="font-medium text-slate-900">
                  {confirmation.email}
                </dd>
              </div>
            )}
            {confirmation.notes && (
              <div className="py-3">
                <dt className="text-slate-500">{lang === 'ar' ? 'الملاحظات الطبية' : 'Clinical Notes'}</dt>
                <dd className="mt-1 text-slate-800">{confirmation.notes}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/962785483349?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <MessageCircle className="h-4 w-4" />
              <span>
                {lang === 'ar'
                  ? 'إرسال بيانات المريض عبر واتساب (962785483349)'
                  : 'Send Patient Details via WhatsApp (962785483349)'}
              </span>
            </a>

            <a
              href={`mailto:dr.motasem.alnsour@gmail.com?subject=${mailSubject}&body=${mailBody}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B3C5D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#082c44]"
            >
              <Mail className="h-4 w-4" />
              <span>
                {lang === 'ar'
                  ? 'إرسال البيانات عبر الإيميل (dr.motasem.alnsour@gmail.com)'
                  : 'Send Details via Email (dr.motasem.alnsour@gmail.com)'}
              </span>
            </a>

            <button
              type="button"
              onClick={() => {
                setConfirmation(null);
                setNotes('');
              }}
              className="cursor-pointer rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {lang === 'ar' ? 'حجز موعد آخر' : 'Book Another Appointment'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
      <div className="max-w-3xl border-b border-slate-200 pb-6">
        <div className="text-xs font-semibold text-[#0369A1]">
          {lang === 'ar'
            ? 'حجز مباشر بدون تسجيل دخول · الرياض · الأردن · أونلاين'
            : 'Direct Booking Without Login · Riyadh · Jordan · Online'}
        </div>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {lang === 'ar' ? 'احجز موعدك مع د. معتصم النسور' : 'Schedule Your Appointment With Dr. Motasem Alnsour'}
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          {lang === 'ar'
            ? 'لا يتطلب إنشاء حساب أو تسجيل دخول — عبّئ بياناتك وأرسل طلب الموعد مباشرة إلى بريد الدكتور وواتساب العيادة.'
            : 'No account or sign-in required — fill in your details and send your appointment directly to the doctor’s email and clinic WhatsApp.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {/* Step 1: Consultation Mode & Country */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">
              <span className="font-mono-num text-[#0369A1] me-2">01.</span>
              {lang === 'ar' ? 'اختر نوع الموعد والموقع' : 'Select Consultation Mode & Location'}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(['online', 'riyadh', 'jordan'] as ConsultationMode[]).map((m) => {
                const isSelected = mode === m;
                const Icon = m === 'online' ? Video : m === 'riyadh' ? MapPin : Globe;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`cursor-pointer rounded-xl border p-4 text-start transition-colors ${
                      isSelected
                        ? 'border-[#0B3C5D] bg-[#0B3C5D] text-white'
                        : 'border-slate-200 bg-slate-50/70 text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-sky-200' : 'text-[#0B3C5D]'}`} />
                    <div className="font-display mt-2.5 text-sm font-bold">{modeMeta[m].title[lang]}</div>
                    <div className={`mt-1 text-xs ${isSelected ? 'text-sky-100' : 'text-slate-600'}`}>
                      {modeMeta[m].subtitle[lang]}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Select Medical Service */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">
              <span className="font-mono-num text-[#0369A1] me-2">02.</span>
              {lang === 'ar' ? 'اختر الخدمة الطبية' : 'Select Medical Service'}
            </h2>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-[#0369A1] focus:outline-none"
            >
              {MEDICAL_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number}. {s.title[lang]}
                </option>
              ))}
            </select>
            <p className="mt-2.5 text-xs text-slate-600">{selectedService.shortDesc[lang]}</p>
          </section>

          {/* Step 3: Date & Time Selection */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-slate-900">
                <span className="font-mono-num text-[#0369A1] me-2">03.</span>
                {lang === 'ar' ? 'اختر التاريخ والوقت' : 'Choose Date & Time'}
              </h2>
              <span className="text-xs text-slate-500">{modeMeta[mode].tz[lang]}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {upcomingDates.map((d) => {
                const isSelected = date === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDate(d)}
                    className={`font-mono-num cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'border-[#0B3C5D] bg-[#0B3C5D] text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Clock className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'الأوقات المتاحة' : 'Available Time Slots'}</span>
              </div>

              {loadingSlots ? (
                <div className="mt-3 text-sm text-slate-500">
                  {lang === 'ar' ? 'جاري التحقق من المواعيد...' : 'Checking slot availability...'}
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const isSelected = timeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setTimeSlot(slot.time)}
                        className={`font-mono-num rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                          !slot.available
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                            : isSelected
                              ? 'cursor-pointer border-[#0B3C5D] bg-[#0B3C5D] text-white'
                              : 'cursor-pointer border-slate-300 bg-white text-slate-800 hover:border-[#0369A1]'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Step 4: Patient Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">
              <span className="font-mono-num text-[#0369A1] me-2">04.</span>
              {lang === 'ar' ? 'بيانات المريض' : 'Patient Information'}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  {lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: أحمد محمد العلي' : 'e.g., Ahmad Al-Ali'}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#0369A1] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  {lang === 'ar' ? 'رقم الجوال / الواتساب *' : 'Phone / WhatsApp *'}
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  className="font-mono-num mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#0369A1] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {lang === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#0369A1] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {lang === 'ar' ? 'سبب الزيارة أو ملاحظات طبية مختصرة (اختياري)' : 'Reason for Visit / Brief Notes (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'اذكر الأعراض الحالية أو الفحوصات المراد مراجعتها...'
                      : 'Briefly describe your symptoms or lab tests to review...'
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#0369A1] focus:outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Booking Summary Sticky Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-display text-lg font-bold text-slate-900">
              {lang === 'ar' ? 'ملخص الموعد' : 'Appointment Summary'}
            </h3>
            <dl className="mt-4 space-y-3 border-y border-slate-200 py-4 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{lang === 'ar' ? 'الطبيب' : 'Physician'}</dt>
                <dd className="font-semibold text-slate-900">
                  {lang === 'ar' ? 'د. معتصم النسور' : 'Dr. Motasem Alnsour'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{lang === 'ar' ? 'المسار' : 'Mode'}</dt>
                <dd className="font-semibold text-[#0B3C5D]">{modeMeta[mode].title[lang]}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{lang === 'ar' ? 'الخدمة' : 'Service'}</dt>
                <dd className="text-end font-semibold text-slate-900">{selectedService.title[lang]}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{lang === 'ar' ? 'التاريخ' : 'Date'}</dt>
                <dd className="font-mono-num font-semibold text-slate-900">{date}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{lang === 'ar' ? 'الوقت' : 'Time'}</dt>
                <dd className="font-mono-num font-semibold text-slate-900">{timeSlot || '—'}</dd>
              </div>
            </dl>

            {errorMsg && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0B3C5D] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#082c44] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>
                {submitting
                  ? lang === 'ar'
                    ? 'جاري إرسال الحجز...'
                    : 'Sending Booking...'
                  : lang === 'ar'
                    ? 'إرسال الحجز مباشرة بدون تسجيل دخول'
                    : 'Send Booking Directly (No Login)'}
              </span>
            </button>
            <p className="mt-2.5 text-center text-[11px] leading-relaxed text-slate-500">
              {lang === 'ar'
                ? 'تُرسل البيانات مباشرة إلى بريد الدكتور (dr.motasem.alnsour@gmail.com) وواتساب العيادة (962785483349).'
                : 'Details are routed directly to dr.motasem.alnsour@gmail.com and clinic WhatsApp (962785483349).'}
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
