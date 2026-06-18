import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarCheck,
  Check,
  Clock,
  Edit3,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Scissors,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { api } from './lib/api';

const fallbackServices = [
  { id: 1, name: 'Signature Consultation', description: 'A focused intake and tailored service plan.', durationMinutes: 45, price: 65, active: true },
  { id: 2, name: 'Premium Service Session', description: 'The core appointment package for high-value clients.', durationMinutes: 60, price: 95, active: true },
  { id: 3, name: 'Follow-up Appointment', description: 'Keep customers on track with a polished return visit.', durationMinutes: 30, price: 45, active: true },
];

const fallbackTestimonials = [
  { id: 1, customerName: 'Maya R.', content: 'The booking experience felt effortless, and the reminder flow reduced no-shows immediately.', rating: 5 },
  { id: 2, customerName: 'Daniel K.', content: 'Our team can finally manage appointments without spreadsheets or missed calls.', rating: 5 },
  { id: 3, customerName: 'Nour A.', content: 'Clean, fast, and professional enough to use for multiple service brands.', rating: 5 },
];

const fallbackBusiness = {
  businessName: 'Scalora Booking Pro',
  phoneNumber: '+1 555 0199',
  whatsappNumber: '+15550199',
  address: 'Downtown Business District',
  openingHours: 'Mon - Sat, 9:00 AM - 7:00 PM',
  logoUrl: '',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: 'https://linkedin.com',
};

const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

function businessSlugFromPath() {
  const match = window.location.pathname.match(/^\/b\/([^/]+)/);
  return match ? match[1] : '';
}

function App() {
  const [route, setRoute] = useState(window.location.hash || '#home');
  const [profileSlug, setProfileSlug] = useState(businessSlugFromPath());
  const [businesses, setBusinesses] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [services, setServices] = useState(fallbackServices);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [businessInfo, setBusinessInfo] = useState(fallbackBusiness);
  const [token, setToken] = useState(localStorage.getItem('scalora_token'));
  const [adminUser, setAdminUser] = useState(() => {
    const stored = localStorage.getItem('scalora_admin');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const onHashChange = () => {
      setRoute(window.location.hash || '#home');
      setProfileSlug(businessSlugFromPath());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const slug = profileSlug || 'edgard-akar';
    Promise.allSettled([
      api.getBusinesses(),
      api.getBusinessServices(slug),
      api.getBusinessTestimonials(slug),
      api.getBusinessProfileInfo(slug),
      api.getBusiness(slug),
    ]).then((results) => {
      if (results[0].status === 'fulfilled') setBusinesses(results[0].value);
      if (results[1].status === 'fulfilled') setServices(results[1].value);
      if (results[2].status === 'fulfilled') setTestimonials(results[2].value);
      if (results[3].status === 'fulfilled') setBusinessInfo({ ...fallbackBusiness, ...results[3].value });
      if (results[4].status === 'fulfilled') {
        setBusinessInfo((current) => ({ ...current, businessName: current.businessName || results[4].value.name }));
      }
    });
  }, [profileSlug]);

  const go = (hash) => {
    window.location.hash = hash;
    setMobileOpen(false);
  };

  const adminVisible = window.location.pathname === '/admin' || route === '#admin' || route === '#dashboard';

  return (
    <div className="min-h-screen bg-[#f7faf9] text-ink">
      <Header businessInfo={businessInfo} onNavigate={go} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      {adminVisible ? (
        token ? (
          <AdminDashboard
            token={token}
            setToken={setToken}
            adminUser={adminUser}
            setAdminUser={setAdminUser}
            services={services}
            setServices={setServices}
            testimonials={testimonials}
            setTestimonials={setTestimonials}
            businessInfo={businessInfo}
            setBusinessInfo={setBusinessInfo}
            businesses={businesses}
            setBusinesses={setBusinesses}
          />
        ) : (
          <AdminLogin setToken={setToken} setAdminUser={setAdminUser} />
        )
      ) : (
        <PublicSite
          businessInfo={businessInfo}
          services={services}
          testimonials={testimonials}
          businesses={businesses}
          profileSlug={profileSlug || 'edgard-akar'}
          onNavigate={go}
        />
      )}
      {!adminVisible && (
        <a
          className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft"
          href={`https://wa.me/${businessInfo.whatsappNumber}`}
          aria-label="Contact on WhatsApp"
        >
          <MessageCircle size={22} />
        </a>
      )}
    </div>
  );
}

function Header({ businessInfo, onNavigate, mobileOpen, setMobileOpen }) {
  const links = [
    ['#home', 'Home'],
    ['#about', 'About'],
    ['#services', 'Services'],
    ['#booking', 'Booking'],
    ['#testimonials', 'Testimonials'],
    ['#contact', 'Contact'],
    ['#admin', 'Admin'],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/92 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button className="flex items-center gap-3 text-left" onClick={() => onNavigate('#home')}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-teal text-white">
            <CalendarCheck size={21} />
          </span>
          <span>
            <span className="block text-sm font-bold">{businessInfo.businessName}</span>
            <span className="block text-xs text-graphite">Online appointment system</span>
          </span>
        </button>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([hash, label]) => (
            <button key={hash} className="rounded-md px-3 py-2 text-sm font-medium text-graphite hover:bg-mist hover:text-ink" onClick={() => onNavigate(hash)}>
              {label}
            </button>
          ))}
        </div>
        <button className="md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation">
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </nav>
      {mobileOpen && (
        <div className="border-t border-line bg-white px-4 py-2 md:hidden">
          {links.map(([hash, label]) => (
            <button key={hash} className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium" onClick={() => onNavigate(hash)}>
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function PublicSite({ businessInfo, services, testimonials, businesses, profileSlug, onNavigate }) {
  return (
    <main>
      <section id="home" className="section min-h-[calc(100vh-72px)] bg-[linear-gradient(110deg,rgba(18,117,111,0.12),rgba(216,95,79,0.08)),url('https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center">
        <div className="section-inner grid min-h-[72vh] items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-sm font-semibold text-teal">
              <ShieldCheck size={16} /> Sell-ready booking website template
            </p>
            <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              Scalora Booking Pro
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-graphite">
              A premium appointment website and admin system for service businesses that need online bookings, customer trust, and clean operations from day one.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary" onClick={() => onNavigate('#booking')}>
                <CalendarCheck size={18} /> Book an Appointment
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('#services')}>
                <Scissors size={18} /> View Services
              </button>
            </div>
          </div>
          <BookingForm services={services} compact />
        </div>
      </section>

      <section id="about" className="section bg-white">
        <div className="section-inner grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase text-coral">Built for local service brands</p>
            <h2 className="mt-3 text-3xl font-bold">A reusable system for real appointment operations.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Fast setup', 'Launch for salons, clinics, tutors, gyms, and other providers.'],
              ['Admin control', 'Manage bookings, services, staff, testimonials, and business info.'],
              ['Customer-ready', 'Mobile booking, maps, contact, testimonials, and WhatsApp.'],
            ].map(([title, copy]) => (
              <article key={title} className="rounded-lg border border-line bg-mist/50 p-5">
                <Check className="mb-4 text-teal" />
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-graphite">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection services={services} />
      <BusinessDirectory businesses={businesses} />
      <section id="booking" className="section bg-mist">
        <div className="section-inner grid gap-8 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="text-sm font-bold uppercase text-coral">Online booking</p>
            <h2 className="mt-3 text-3xl font-bold">Reserve a time in under a minute.</h2>
            <p className="mt-4 text-graphite">The API prevents duplicate appointments for the same service, date, and time, then stores each booking with a lifecycle status.</p>
          </div>
          <BookingForm services={services} />
        </div>
      </section>
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection businessInfo={businessInfo} profileSlug={profileSlug} />
    </main>
  );
}

function BusinessDirectory({ businesses }) {
  if (!businesses.length) return null;
  return (
    <section className="section bg-white">
      <div className="section-inner">
        <p className="text-sm font-bold uppercase text-coral">Scalora businesses</p>
        <h2 className="mt-3 text-3xl font-bold">One platform, many business profiles.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {businesses.map((business) => (
            <a key={business.id} className="rounded-lg border border-line bg-[#fbfdfc] p-5 transition hover:border-teal" href={`/b/${business.slug}#home`}>
              <p className="font-bold">{business.name}</p>
              <p className="mt-2 text-sm text-graphite">scalorabooking.com/b/{business.slug}</p>
              <p className="mt-3 text-sm leading-6 text-graphite">{business.tagline}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ services }) {
  return (
    <section id="services" className="section bg-[#fbfdfc]">
      <div className="section-inner">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-coral">Services</p>
            <h2 className="mt-3 text-3xl font-bold">Flexible catalog for any appointment business.</h2>
          </div>
          <span className="text-sm text-graphite">{services.filter((service) => service.active).length} active services</span>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {services.filter((service) => service.active).map((service) => (
            <article key={service.id} className="rounded-lg border border-line bg-white p-6 shadow-sm">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md bg-mist text-teal">
                <Clock />
              </div>
              <h3 className="text-xl font-bold">{service.name}</h3>
              <p className="mt-3 min-h-16 text-sm leading-6 text-graphite">{service.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm text-graphite">{service.durationMinutes} min</span>
                <span className="font-bold text-teal">${service.price}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingForm({ services, compact = false }) {
  const [form, setForm] = useState({
    serviceId: services[0]?.id || '',
    appointmentDate: '',
    appointmentTime: '',
    customerName: '',
    phoneNumber: '',
    email: '',
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!form.serviceId && services[0]?.id) setForm((current) => ({ ...current, serviceId: services[0].id }));
  }, [services, form.serviceId]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await api.createBooking({ ...form, serviceId: Number(form.serviceId) });
      setMessage('Booking request received. We will confirm it shortly.');
      setForm((current) => ({ ...current, customerName: '', phoneNumber: '', email: '', notes: '' }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`rounded-lg border border-line bg-white p-5 shadow-soft ${compact ? 'lg:max-w-md lg:justify-self-end' : ''}`}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">Book Online</h2>
        <CalendarCheck className="text-teal" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="service">Service</label>
          <select id="service" value={form.serviceId} onChange={(event) => update('serviceId', event.target.value)} required>
            {services.filter((service) => service.active).map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={form.appointmentDate} onChange={(event) => update('appointmentDate', event.target.value)} required />
        </div>
        <div>
          <label htmlFor="time">Time</label>
          <input id="time" type="time" value={form.appointmentTime} onChange={(event) => update('appointmentTime', event.target.value)} required />
        </div>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" value={form.customerName} onChange={(event) => update('customerName', event.target.value)} required />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" value={form.phoneNumber} onChange={(event) => update('phoneNumber', event.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" rows={compact ? 2 : 4} value={form.notes} onChange={(event) => update('notes', event.target.value)} />
        </div>
      </div>
      <button className="btn-primary mt-5 w-full" disabled={busy}>
        {busy ? 'Sending...' : 'Request Booking'}
      </button>
      {message && <p className="mt-3 rounded-md bg-mist px-3 py-2 text-sm text-graphite">{message}</p>}
    </form>
  );
}

function TestimonialsSection({ testimonials }) {
  return (
    <section id="testimonials" className="section bg-white">
      <div className="section-inner">
        <p className="text-sm font-bold uppercase text-coral">Testimonials</p>
        <h2 className="mt-3 text-3xl font-bold">Trust signals for customers before they book.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="rounded-lg border border-line bg-[#fbfdfc] p-6">
              <div className="mb-4 flex gap-1 text-gold">
                {Array.from({ length: testimonial.rating || 5 }).map((_, index) => <Star key={index} size={17} fill="currentColor" />)}
              </div>
              <p className="text-sm leading-6 text-graphite">"{testimonial.content}"</p>
              <p className="mt-4 font-bold">{testimonial.customerName}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ businessInfo, profileSlug }) {
  const [sent, setSent] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', message: '' });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.sendContact(form, profileSlug);
      setSent('Message sent. The business owner can review it from the backend.');
      setForm({ name: '', email: '', phoneNumber: '', message: '' });
    } catch (error) {
      setSent(error.message);
    }
  };

  return (
    <section id="contact" className="section bg-mist">
      <div className="section-inner grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase text-coral">Contact</p>
          <h2 className="mt-3 text-3xl font-bold">Location, phone, WhatsApp, and enquiry capture.</h2>
          <div className="mt-6 space-y-4 text-sm text-graphite">
            <p className="flex items-center gap-3"><Phone className="text-teal" /> {businessInfo.phoneNumber}</p>
            <p className="flex items-center gap-3"><MapPin className="text-teal" /> {businessInfo.address}</p>
            <p className="flex items-center gap-3"><Clock className="text-teal" /> {businessInfo.openingHours}</p>
          </div>
          <iframe
            title="Business location"
            className="mt-8 h-64 w-full rounded-lg border border-line"
            loading="lazy"
            src={`https://www.google.com/maps?q=${encodeURIComponent(businessInfo.address)}&output=embed`}
          />
        </div>
        <form onSubmit={submit} className="rounded-lg border border-line bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div>
              <label htmlFor="contact-phone">Phone</label>
              <input id="contact-phone" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" rows="5" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
            </div>
          </div>
          <button className="btn-primary mt-5"><MessageCircle size={18} /> Send Message</button>
          {sent && <p className="mt-3 rounded-md bg-mist px-3 py-2 text-sm text-graphite">{sent}</p>}
        </form>
      </div>
    </section>
  );
}

function AdminLogin({ setToken, setAdminUser }) {
  const [form, setForm] = useState({ email: 'admin@scalora.local', password: 'Admin123!' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const result = await api.login(form);
      localStorage.setItem('scalora_token', result.token);
      localStorage.setItem('scalora_admin', JSON.stringify(result));
      setToken(result.token);
      setAdminUser(result);
      window.location.hash = '#dashboard';
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <main className="section min-h-[calc(100vh-72px)] bg-mist">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="text-teal" />
          <div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-sm text-graphite">Secure dashboard access with JWT.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="admin-email">Email</label>
            <input id="admin-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </div>
          <div>
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </div>
        </div>
        <button className="btn-primary mt-6 w-full">Login</button>
        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </form>
    </main>
  );
}

function AdminDashboard({ setToken, adminUser, setAdminUser, services, setServices, testimonials, setTestimonials, businessInfo, setBusinessInfo, businesses, setBusinesses }) {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [businessDraft, setBusinessDraft] = useState({ name: '', slug: '', tagline: '', active: true });
  const [filters, setFilters] = useState({ status: '', date: '', serviceId: '' });
  const [serviceDraft, setServiceDraft] = useState({ name: '', description: '', durationMinutes: 60, price: 80, active: true });
  const [staffDraft, setStaffDraft] = useState({ name: '', role: '', email: '', phoneNumber: '', active: true });
  const [testimonialDraft, setTestimonialDraft] = useState({ customerName: '', content: '', rating: 5, active: true });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const isSuperAdmin = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'ADMIN';

  const loadAdminData = () => {
    api.getAdminBusinesses().then((items) => {
      setBusinesses(items);
      if (!selectedBusinessId && items[0]?.id) setSelectedBusinessId(String(items[0].id));
    }).catch(() => {});
    if (!selectedBusinessId) return;
    const scope = { ...filters, businessId: selectedBusinessId };
    api.getBookings(scope).then(setBookings).catch(() => setBookings([]));
    api.getBookings({ businessId: selectedBusinessId }).then(setAllBookings).catch(() => setAllBookings([]));
    api.getStaff(selectedBusinessId).then(setStaff).catch(() => setStaff([]));
    api.getAdminServices(selectedBusinessId).then(setServices).catch(() => {});
    api.getAdminTestimonials(selectedBusinessId).then(setTestimonials).catch(() => {});
    api.getAdminBusinessInfo(selectedBusinessId).then((info) => setBusinessInfo({ ...fallbackBusiness, ...info })).catch(() => {});
  };

  useEffect(loadAdminData, [filters.status, filters.date, filters.serviceId, selectedBusinessId]);

  const stats = useMemo(() => ({
    total: allBookings.length,
    pending: allBookings.filter((booking) => booking.status === 'PENDING').length,
    confirmed: allBookings.filter((booking) => booking.status === 'CONFIRMED').length,
    completed: allBookings.filter((booking) => booking.status === 'COMPLETED').length,
  }), [allBookings]);

  const logout = () => {
    localStorage.removeItem('scalora_token');
    localStorage.removeItem('scalora_admin');
    setToken(null);
    setAdminUser(null);
    window.location.hash = '#admin';
  };

  const saveService = async () => {
    const payload = { ...serviceDraft, price: Number(serviceDraft.price), durationMinutes: Number(serviceDraft.durationMinutes) };
    const saved = editingServiceId ? await api.updateService(editingServiceId, payload) : await api.createService(payload, selectedBusinessId);
    setServices((current) => editingServiceId ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved]);
    setEditingServiceId(null);
    setServiceDraft({ name: '', description: '', durationMinutes: 60, price: 80, active: true });
  };

  const saveStaff = async () => {
    const saved = editingStaffId ? await api.updateStaff(editingStaffId, staffDraft) : await api.createStaff(staffDraft, selectedBusinessId);
    setStaff((current) => editingStaffId ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved]);
    setEditingStaffId(null);
    setStaffDraft({ name: '', role: '', email: '', phoneNumber: '', active: true });
  };

  const saveTestimonial = async () => {
    const payload = { ...testimonialDraft, rating: Number(testimonialDraft.rating) };
    const saved = editingTestimonialId ? await api.updateTestimonial(editingTestimonialId, payload) : await api.createTestimonial(payload, selectedBusinessId);
    setTestimonials((current) => editingTestimonialId ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved]);
    setEditingTestimonialId(null);
    setTestimonialDraft({ customerName: '', content: '', rating: 5, active: true });
  };

  const saveBusiness = async () => {
    const created = await api.createBusiness(businessDraft);
    setBusinesses((current) => [...current, created]);
    setSelectedBusinessId(String(created.id));
    setBusinessDraft({ name: '', slug: '', tagline: '', active: true });
  };

  return (
    <main className="section bg-[#f7faf9]">
      <div className="section-inner">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-coral">Admin dashboard</p>
            <h1 className="text-3xl font-bold">{isSuperAdmin ? 'Scalora platform admin' : 'Business admin dashboard'}</h1>
            <p className="mt-1 text-sm text-graphite">{adminUser?.email}</p>
          </div>
          <button className="btn-secondary" onClick={logout}>Logout</button>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Stat icon={BarChart3} label="Total" value={stats.total} />
          <Stat icon={Clock} label="Pending" value={stats.pending} />
          <Stat icon={CalendarCheck} label="Confirmed" value={stats.confirmed} />
          <Stat icon={Check} label="Completed" value={stats.completed} />
        </div>

        <section className="mt-8 rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
            <div>
              <label htmlFor="business-select">Managed business</label>
              <select id="business-select" value={selectedBusinessId} onChange={(event) => {
                setSelectedBusinessId(event.target.value);
                setFilters({ status: '', date: '', serviceId: '' });
              }}>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>{business.name} - /b/{business.slug}</option>
                ))}
              </select>
            </div>
            {isSuperAdmin ? (
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.4fr_auto]">
                <input placeholder="Business name" value={businessDraft.name} onChange={(event) => setBusinessDraft({ ...businessDraft, name: event.target.value })} />
                <input placeholder="slug-name" value={businessDraft.slug} onChange={(event) => setBusinessDraft({ ...businessDraft, slug: event.target.value })} />
                <input placeholder="Tagline" value={businessDraft.tagline} onChange={(event) => setBusinessDraft({ ...businessDraft, tagline: event.target.value })} />
                <button className="btn-primary" onClick={saveBusiness}><Plus size={18} /> Add</button>
              </div>
            ) : (
              <div className="rounded-md bg-mist px-4 py-3 text-sm text-graphite">
                Business admins can manage bookings, services, staff, testimonials, and profile details for their assigned business only.
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <h2 className="text-xl font-bold">Bookings</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="">All statuses</option>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
              <select value={filters.serviceId} onChange={(event) => setFilters({ ...filters, serviceId: event.target.value })}>
                <option value="">All services</option>
                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
            </div>
          </div>
          <ResponsiveTable
            columns={['Customer', 'Service', 'Date', 'Time', 'Status']}
            rows={bookings.map((booking) => [
              <span>{booking.customerName}<span className="block text-xs text-graphite">{booking.phoneNumber}</span></span>,
              booking.serviceName,
              booking.appointmentDate,
              booking.appointmentTime,
              <select
                value={booking.status}
                onChange={async (event) => {
                  const updated = await api.updateBookingStatus(booking.id, event.target.value);
                  setBookings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
                  setAllBookings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
                }}
              >
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>,
            ])}
          />
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Manager title="Services" icon={Edit3} draft={serviceDraft} setDraft={setServiceDraft} onSave={saveService}>
            <input placeholder="Service name" value={serviceDraft.name} onChange={(event) => setServiceDraft({ ...serviceDraft, name: event.target.value })} />
            <textarea placeholder="Description" value={serviceDraft.description} onChange={(event) => setServiceDraft({ ...serviceDraft, description: event.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Minutes" value={serviceDraft.durationMinutes} onChange={(event) => setServiceDraft({ ...serviceDraft, durationMinutes: event.target.value })} />
              <input type="number" placeholder="Price" value={serviceDraft.price} onChange={(event) => setServiceDraft({ ...serviceDraft, price: event.target.value })} />
            </div>
            <MiniList
              items={services}
              label={(item) => `${item.name} - $${item.price}`}
              onEdit={(item) => {
                setEditingServiceId(item.id);
                setServiceDraft({ name: item.name, description: item.description, durationMinutes: item.durationMinutes, price: item.price, active: item.active });
              }}
              onDelete={async (id) => { await api.deleteService(id); setServices((current) => current.filter((item) => item.id !== id)); }}
            />
          </Manager>

          <Manager title="Staff" icon={Users} onSave={saveStaff}>
            <input placeholder="Name" value={staffDraft.name} onChange={(event) => setStaffDraft({ ...staffDraft, name: event.target.value })} />
            <input placeholder="Role" value={staffDraft.role} onChange={(event) => setStaffDraft({ ...staffDraft, role: event.target.value })} />
            <input placeholder="Email" value={staffDraft.email} onChange={(event) => setStaffDraft({ ...staffDraft, email: event.target.value })} />
            <input placeholder="Phone" value={staffDraft.phoneNumber} onChange={(event) => setStaffDraft({ ...staffDraft, phoneNumber: event.target.value })} />
            <MiniList
              items={staff}
              label={(item) => `${item.name} - ${item.role}`}
              onEdit={(item) => {
                setEditingStaffId(item.id);
                setStaffDraft({ name: item.name, role: item.role, email: item.email || '', phoneNumber: item.phoneNumber || '', active: item.active });
              }}
              onDelete={async (id) => { await api.deleteStaff(id); setStaff((current) => current.filter((item) => item.id !== id)); }}
            />
          </Manager>

          <Manager title="Testimonials" icon={Star} onSave={saveTestimonial}>
            <input placeholder="Customer name" value={testimonialDraft.customerName} onChange={(event) => setTestimonialDraft({ ...testimonialDraft, customerName: event.target.value })} />
            <textarea placeholder="Content" value={testimonialDraft.content} onChange={(event) => setTestimonialDraft({ ...testimonialDraft, content: event.target.value })} />
            <input type="number" min="1" max="5" value={testimonialDraft.rating} onChange={(event) => setTestimonialDraft({ ...testimonialDraft, rating: event.target.value })} />
            <MiniList
              items={testimonials}
              label={(item) => `${item.customerName} - ${item.rating} stars`}
              onEdit={(item) => {
                setEditingTestimonialId(item.id);
                setTestimonialDraft({ customerName: item.customerName, content: item.content, rating: item.rating, active: item.active });
              }}
              onDelete={async (id) => { await api.deleteTestimonial(id); setTestimonials((current) => current.filter((item) => item.id !== id)); }}
            />
          </Manager>
        </div>

        <section className="mt-8 rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Business Information</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.keys(fallbackBusiness).map((key) => (
              <input
                key={key}
                placeholder={key}
                value={businessInfo[key] || ''}
                onChange={(event) => setBusinessInfo({ ...businessInfo, [key]: event.target.value })}
              />
            ))}
          </div>
          <button className="btn-primary mt-4" onClick={async () => setBusinessInfo(await api.updateBusinessInfo(businessInfo, selectedBusinessId))}>
            <Save size={18} /> Save Business Info
          </button>
        </section>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <Icon className="mb-4 text-teal" />
      <p className="text-sm text-graphite">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </article>
  );
}

function ResponsiveTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase text-graphite">
            {columns.map((column) => <th key={column} className="px-3 py-3 font-bold">{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="px-3 py-6 text-graphite" colSpan={columns.length}>No records found.</td></tr>
          ) : rows.map((row, index) => (
            <tr key={index} className="border-b border-line last:border-0">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3 align-middle">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Manager({ title, icon: Icon, onSave, children }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Icon className="text-teal" />
      </div>
      <div className="space-y-3">{children}</div>
      <button className="btn-primary mt-4 w-full" onClick={onSave}><Plus size={18} /> Save {title}</button>
    </section>
  );
}

function MiniList({ items, label, onEdit, onDelete }) {
  return (
    <div className="max-h-44 overflow-auto rounded-md border border-line">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 border-b border-line px-3 py-2 text-sm last:border-0">
          <span className="truncate">{label(item)}</span>
          <span className="flex items-center gap-2">
            <button className="text-teal" onClick={() => onEdit(item)} aria-label="Edit item"><Edit3 size={16} /></button>
            <button className="text-coral" onClick={() => onDelete(item.id)} aria-label="Delete item"><Trash2 size={16} /></button>
          </span>
        </div>
      ))}
    </div>
  );
}

export default App;
