import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Building2,
  CalendarCheck,
  Check,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  ImagePlus,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { api } from './lib/api';

const fallbackServices = [];
const fallbackTestimonials = [];

const fallbackBusiness = {
  businessName: 'Scalora Booking Pro',
  name: 'Scalora Booking Pro',
  tagline: 'Premium appointments for modern service businesses.',
  description: '',
  phoneNumber: '+1 555 0199',
  phone: '+1 555 0199',
  whatsappNumber: '+15550199',
  email: '',
  address: 'Downtown Business District',
  googleMapsUrl: '',
  openingHours: 'Mon - Sat, 9:00 AM - 7:00 PM',
  logoUrl: '',
  coverImageUrl: '',
  galleryImageUrls: '',
  primaryColor: '#12756f',
  secondaryColor: '#eef6f4',
  accentColor: '#d85f4f',
  fontStyle: 'Inter',
  buttonStyle: 'rounded',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  tiktokUrl: '',
};

const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

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
  const [publicStaff, setPublicStaff] = useState([]);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [businessInfo, setBusinessInfo] = useState(fallbackBusiness);
  const [businessUnavailable, setBusinessUnavailable] = useState(false);
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
    if (!profileSlug) {
      api.getBusinesses().then(setBusinesses).catch(() => setBusinesses([]));
      setServices([]);
      setPublicStaff([]);
      setTestimonials([]);
      setBusinessInfo(fallbackBusiness);
      setBusinessUnavailable(false);
      return;
    }
    Promise.allSettled([
      api.getBusinesses(),
      api.getBusinessServices(profileSlug),
      api.getBusinessStaff(profileSlug),
      api.getBusinessTestimonials(profileSlug),
      api.getPublicBusiness(profileSlug),
    ]).then((results) => {
      if (results[0].status === 'fulfilled') setBusinesses(results[0].value);
      if (results[1].status === 'fulfilled') setServices(results[1].value);
      if (results[2].status === 'fulfilled') setPublicStaff(results[2].value);
      if (results[3].status === 'fulfilled') setTestimonials(results[3].value);
      if (results[4].status === 'fulfilled') {
        const profile = results[4].value;
        setBusinessUnavailable(false);
        setBusinessInfo({
          ...fallbackBusiness,
          ...profile,
          businessName: profile.name,
          phoneNumber: profile.phone || profile.phoneNumber,
        });
      } else {
        const listedBusiness = results[0].status === 'fulfilled'
          ? results[0].value.find((business) => business.slug === profileSlug)
          : null;
        if (listedBusiness) {
          setBusinessUnavailable(false);
          setBusinessInfo({
            ...fallbackBusiness,
            ...listedBusiness,
            businessName: listedBusiness.name,
            phoneNumber: listedBusiness.phone || listedBusiness.phoneNumber,
          });
        } else {
          setBusinessUnavailable(true);
        }
      }
    });
  }, [profileSlug]);

  const go = (hash) => {
    const publicDestination = hash !== '#admin' && hash !== '#dashboard';
    if (publicDestination && window.location.pathname === '/admin') {
      window.history.pushState(null, '', `/${hash}`);
    } else if (hash === '#admin' && window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin#admin');
    } else {
      window.location.hash = hash;
    }
    setRoute(hash);
    setProfileSlug(businessSlugFromPath());
    setMobileOpen(false);
    if (hash === '#businesses' && !businessSlugFromPath()) {
      api.getBusinesses().then(setBusinesses).catch(() => setBusinesses([]));
    }
    window.requestAnimationFrame(() => {
      const target = document.querySelector(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const adminVisible = window.location.pathname === '/admin' || route === '#admin' || route === '#dashboard';

  return (
    <div className="min-h-screen bg-[#f7faf9] text-ink">
      <Header businessInfo={businessInfo} onNavigate={go} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isPlatform={!profileSlug} />
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
          staff={publicStaff}
          testimonials={testimonials}
          businesses={businesses}
          profileSlug={profileSlug}
          businessUnavailable={businessUnavailable}
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

function Header({ businessInfo, onNavigate, mobileOpen, setMobileOpen, isPlatform }) {
  const links = isPlatform ? [
    ['#home', 'Home'],
    ['#businesses', 'Businesses'],
    ['#admin', 'Admin'],
  ] : [
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

function PublicSite({ businessInfo, services, staff, testimonials, businesses, profileSlug, businessUnavailable, onNavigate }) {
  if (!profileSlug) {
    return <PlatformHome businesses={businesses} onNavigate={onNavigate} />;
  }

  if (businessUnavailable) {
    return (
      <main className="section min-h-[calc(100vh-72px)] bg-mist">
        <div className="section-inner max-w-2xl rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <h1 className="text-3xl font-bold">Business unavailable</h1>
          <p className="mt-3 text-graphite">This business profile is inactive or no longer available for public booking.</p>
          <a className="btn-primary mt-6" href="/">Back to Scalora Booking</a>
        </div>
      </main>
    );
  }

  const primary = businessInfo.primaryColor || '#12756f';
  const accent = businessInfo.accentColor || '#d85f4f';
  const gallery = imageList(businessInfo.galleryImageUrls);

  return (
    <main style={{ '--brand-primary': primary, '--brand-accent': accent, fontFamily: businessInfo.fontStyle || 'Inter, sans-serif' }}>
      <section
        id="home"
        className="section min-h-[calc(100vh-72px)] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(110deg,rgba(255,255,255,0.88),rgba(255,255,255,0.62)),url('${businessInfo.coverImageUrl || 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=80'}')`,
        }}
      >
        <div className="section-inner grid min-h-[72vh] items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-3xl">
            {businessInfo.logoUrl && <img className="mb-5 h-20 w-20 rounded-lg object-cover shadow-soft" src={businessInfo.logoUrl} alt={`${businessInfo.businessName} logo`} />}
            <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-sm font-semibold" style={{ color: primary }}>
              <ShieldCheck size={16} /> {businessInfo.tagline || 'Online booking available'}
            </p>
            <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              {businessInfo.businessName || businessInfo.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-graphite">
              {businessInfo.description || 'View services, meet the team, and reserve an appointment online from this business profile.'}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary" style={{ backgroundColor: primary }} onClick={() => onNavigate('#booking')}>
                <CalendarCheck size={18} /> Book an Appointment
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('#services')}>View Services</button>
            </div>
          </div>
          <div id="booking">
            <BookingForm services={services} profileSlug={profileSlug} compact />
          </div>
        </div>
      </section>

      <section id="about" className="section bg-white">
        <div className="section-inner grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase" style={{ color: accent }}>About</p>
            <h2 className="mt-3 text-3xl font-bold">{businessInfo.businessName || businessInfo.name}</h2>
            <p className="mt-4 text-graphite">{businessInfo.description || businessInfo.tagline}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Services', 'Browse available appointment services.'],
              ['Availability', 'Book from open time slots and capacity.'],
              ['Contact', 'Reach the business by phone, WhatsApp, or the contact form.'],
            ].map(([title, copy]) => (
              <article key={title} className="rounded-lg border border-line bg-mist/50 p-5">
                <Check className="mb-4" style={{ color: primary }} />
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-graphite">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection services={services} />
      <StaffSection staff={staff} />
      {gallery.length > 0 && (
        <section className="section bg-white">
          <div className="section-inner">
            <p className="text-sm font-bold uppercase" style={{ color: accent }}>Gallery</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {gallery.map((image) => (
                <img key={image} className="h-56 w-full rounded-lg object-cover" src={image} alt={`${businessInfo.businessName} gallery`} />
              ))}
            </div>
          </div>
        </section>
      )}
      <BusinessDirectory businesses={businesses} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection businessInfo={businessInfo} profileSlug={profileSlug} />
    </main>
  );
}

function PlatformHome({ businesses, onNavigate }) {
  return (
    <main>
      <section id="home" className="section bg-mist">
        <div className="section-inner grid min-h-[68vh] items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-teal">
              <ShieldCheck size={16} /> Scalora Booking Platform
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Scalora Booking Pro</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-graphite">
              One main booking system for many businesses, each with its own profile, branding, services, availability, and dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary" onClick={() => onNavigate('#businesses')}>Browse Businesses</button>
              <button className="btn-secondary" onClick={() => onNavigate('#admin')}>Admin Login</button>
            </div>
          </div>
          <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold">Platform overview</h2>
            <div className="mt-5 grid gap-3">
              {['Main Scalora admin manages business profiles', 'Each business manages its own operations', 'Customers book from real availability and slot capacity'].map((item) => (
                <p key={item} className="flex items-center gap-3 text-sm text-graphite"><Check className="text-teal" size={18} /> {item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="businesses">
        <BusinessDirectory businesses={businesses} />
      </section>
    </main>
  );
}

function BusinessDirectory({ businesses }) {
  return (
    <section className="section bg-white">
      <div className="section-inner">
        <p className="text-sm font-bold uppercase text-coral">Scalora businesses</p>
        <h2 className="mt-3 text-3xl font-bold">One platform, many business profiles.</h2>
        {businesses.length === 0 ? (
          <div className="mt-8 rounded-lg border border-line bg-[#fbfdfc] p-6 text-sm text-graphite">
            No businesses are published yet. Add an active business from the Super Admin dashboard and it will appear here.
            <span className="mt-2 block font-mono text-xs">{window.__SCALORA_CONFIG__?.API_BASE_URL || 'API'}/public/businesses</span>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {businesses.map((business) => (
              <a key={business.id} className="rounded-lg border border-line bg-[#fbfdfc] p-5 transition hover:border-teal" href={`/b/${business.slug}#home`}>
                <p className="font-bold">{business.name}</p>
                <p className="mt-2 text-sm text-graphite">{window.location.origin}/b/{business.slug}</p>
                <p className="mt-3 text-sm leading-6 text-graphite">{business.tagline}</p>
              </a>
            ))}
          </div>
        )}
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

function StaffSection({ staff }) {
  if (!staff?.length) return null;
  return (
    <section className="section bg-white">
      <div className="section-inner">
        <p className="text-sm font-bold uppercase text-coral">Staff</p>
        <h2 className="mt-3 text-3xl font-bold">Meet the team.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {staff.filter((member) => member.active).map((member) => (
            <article key={member.id} className="rounded-lg border border-line bg-[#fbfdfc] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-mist font-bold text-teal">
                {member.name?.slice(0, 2)?.toUpperCase()}
              </div>
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="mt-2 text-sm text-graphite">{member.role}</p>
              {member.phoneNumber && <p className="mt-3 text-sm text-graphite">{member.phoneNumber}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingForm({ services, profileSlug, compact = false }) {
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
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!form.serviceId && services[0]?.id) setForm((current) => ({ ...current, serviceId: services[0].id }));
  }, [services, form.serviceId]);

  useEffect(() => {
    if (!profileSlug || !form.serviceId || !form.appointmentDate) {
      setSlots([]);
      return;
    }
    api.getAvailabilitySlots(profileSlug, form.serviceId, form.appointmentDate)
      .then((items) => {
        setSlots(items);
        if (!items.some((slot) => slot.time === form.appointmentTime)) {
          setForm((current) => ({ ...current, appointmentTime: items[0]?.time || '' }));
        }
      })
      .catch(() => setSlots([]));
  }, [profileSlug, form.serviceId, form.appointmentDate]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const payload = { ...form, serviceId: Number(form.serviceId) };
      if (profileSlug) {
        await api.createPublicBusinessBooking(profileSlug, payload);
      } else {
        await api.createBooking(payload);
      }
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
          <select id="time" value={form.appointmentTime} onChange={(event) => update('appointmentTime', event.target.value)} required>
            <option value="">Select time</option>
            {slots.map((slot) => (
              <option key={slot.time} value={slot.time}>{slot.time} ({slot.remaining} left)</option>
            ))}
          </select>
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
            src={businessInfo.googleMapsUrl || `https://www.google.com/maps?q=${encodeURIComponent(businessInfo.address || '')}&output=embed`}
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
  const [form, setForm] = useState({ email: '', password: '' });
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

const emptyBusinessDraft = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  logoUrl: '',
  coverImageUrl: '',
  galleryImageUrls: '',
  primaryColor: '#12756f',
  secondaryColor: '#eef6f4',
  accentColor: '#d85f4f',
  fontStyle: 'Inter',
  buttonStyle: 'rounded',
  phone: '',
  whatsappNumber: '',
  email: '',
  address: '',
  googleMapsUrl: '',
  openingHours: '',
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  ownerName: '',
  ownerEmail: '',
  temporaryPassword: '',
  active: true,
};

function publicLink(slug) {
  return `/b/${slug || ''}`;
}

function slugify(value) {
  return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
}

function adminLoginLink() {
  return '/admin';
}

function imageList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}

function SuperAdminDashboard({ setToken, setAdminUser, adminUser, businesses, setBusinesses }) {
  const [activeNav, setActiveNav] = useState('Businesses');
  const [analytics, setAnalytics] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [draft, setDraft] = useState(emptyBusinessDraft);
  const [operationPanel, setOperationPanel] = useState(null);

  const selectedBusiness = businesses.find((business) => String(business.id) === String(selectedBusinessId)) || businesses[0];

  const loadPlatform = () => {
    api.getSuperBusinesses().then((items) => {
      setBusinesses(items);
      if (!selectedBusinessId && items[0]?.id) setSelectedBusinessId(String(items[0].id));
    }).catch(() => {});
    api.getSuperAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  };

  useEffect(loadPlatform, []);

  const logout = () => {
    localStorage.removeItem('scalora_token');
    localStorage.removeItem('scalora_admin');
    setToken(null);
    setAdminUser(null);
    window.location.hash = '#admin';
  };

  const openCreate = () => {
    setEditingBusiness(null);
    setDraft(emptyBusinessDraft);
    setModalOpen(true);
  };

  const openEdit = (business) => {
    setEditingBusiness(business);
    setDraft({ ...emptyBusinessDraft, ...business, phone: business.phone || business.phoneNumber || '' });
    setModalOpen(true);
  };

  const saveBusiness = async (event) => {
    event.preventDefault();
    if (!editingBusiness && draft.ownerEmail && !draft.temporaryPassword) {
      window.alert('Generate a temporary password before creating the business owner account.');
      return;
    }
    const payload = { ...draft, slug: slugify(draft.slug || draft.name) };
    const saved = editingBusiness
      ? await api.updateSuperBusiness(editingBusiness.id, payload)
      : await api.createSuperBusiness(payload);
    setBusinesses((current) => editingBusiness
      ? current.map((business) => (business.id === saved.id ? saved : business))
      : [...current, saved]);
    setSelectedBusinessId(String(saved.id));
    setModalOpen(false);
    api.getSuperAnalytics().then(setAnalytics).catch(() => {});
  };

  const toggleStatus = async (business) => {
    const updated = await api.patchSuperBusinessStatus(business.id, !business.active);
    setBusinesses((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    api.getSuperAnalytics().then(setAnalytics).catch(() => {});
  };

  const deleteBusiness = async (business) => {
    if (!window.confirm(`Delete ${business.name}? This cannot be undone.`)) return;
    await api.deleteSuperBusiness(business.id);
    setBusinesses((current) => current.filter((item) => item.id !== business.id));
    if (String(selectedBusinessId) === String(business.id)) setSelectedBusinessId('');
    api.getSuperAnalytics().then(setAnalytics).catch(() => {});
  };

  const openBusinessOperations = (business, section) => {
    setSelectedBusinessId(String(business.id));
    setOperationPanel({ business, section });
    setActiveNav('Businesses');
  };

  const filteredBusinesses = businesses.filter((business) => {
    const query = search.toLowerCase();
    const matchesQuery = !query || business.name?.toLowerCase().includes(query) || business.slug?.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? business.active : !business.active);
    const matchesDate = !dateFilter || business.createdAt?.startsWith(dateFilter);
    return matchesQuery && matchesStatus && matchesDate;
  });

  const metrics = [
    ['Total Businesses', analytics?.totalBusinesses ?? businesses.length, Building2],
    ['Active Businesses', analytics?.activeBusinesses ?? businesses.filter((business) => business.active).length, Check],
    ['Inactive Businesses', analytics?.inactiveBusinesses ?? businesses.filter((business) => !business.active).length, Clock],
    ['Bookings Today', analytics?.bookingsToday ?? 0, CalendarCheck],
    ['Pending Bookings', analytics?.pendingBookings ?? 0, Clock],
    ['New Businesses This Month', analytics?.newBusinessesThisMonth ?? 0, Plus],
  ];

  const navItems = [
    ['Dashboard', BarChart3],
    ['Businesses', Building2],
    ['Bookings', CalendarCheck],
    ['Users', Users],
    ['Analytics', BarChart3],
    ['Platform Settings', Settings],
  ];

  const metricGrid = (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {metrics.map(([label, value, Icon]) => (
        <article key={label} className="rounded-lg border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-graphite">{label}</span>
            <Icon className="text-teal" size={18} />
          </div>
          <p className="text-2xl font-bold">{value}</p>
        </article>
      ))}
    </div>
  );

  const businessTable = (
    <section className="rounded-lg border border-line bg-white shadow-sm">
      <div className="border-b border-line p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-lg font-bold">Businesses</h3>
          <div className="grid gap-3 sm:grid-cols-[1.3fr_150px_160px] lg:w-[680px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-graphite" size={17} />
              <input className="pl-9" placeholder="Search name or slug" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          </div>
        </div>
      </div>
      <ResponsiveTable
        columns={['Logo', 'Business Name', 'Slug', 'Status', 'Created Date', 'Public Link', 'Actions']}
        rows={filteredBusinesses.map((business) => [
          business.logoUrl ? <img className="h-10 w-10 rounded-md object-cover" src={business.logoUrl} alt="" /> : <span className="flex h-10 w-10 items-center justify-center rounded-md bg-mist text-xs font-bold text-teal">{business.name?.slice(0, 2)?.toUpperCase()}</span>,
          <button className="text-left font-semibold hover:text-teal" onClick={() => setSelectedBusinessId(String(business.id))}>{business.name}</button>,
          <span className="font-mono text-xs">/{business.slug}</span>,
          <span className={`rounded-md px-2 py-1 text-xs font-bold ${business.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{business.active ? 'ACTIVE' : 'INACTIVE'}</span>,
          business.createdAt ? new Date(business.createdAt).toLocaleDateString() : '-',
          <span className="font-mono text-xs text-graphite">{publicLink(business.slug)}</span>,
          <div className="flex flex-wrap gap-2">
            <a className="btn-secondary px-2 py-1.5" href={publicLink(business.slug)} target="_blank" rel="noreferrer" aria-label="View public page"><ExternalLink size={15} /></a>
            <button className="btn-secondary px-2 py-1.5" onClick={() => openEdit(business)} aria-label="Edit business"><Edit3 size={15} /></button>
            <button className="btn-secondary px-2 py-1.5" onClick={() => toggleStatus(business)}>{business.active ? 'Deactivate' : 'Activate'}</button>
            <button className="btn-secondary border-coral px-2 py-1.5 text-coral" onClick={() => deleteBusiness(business)} aria-label="Delete business"><Trash2 size={15} /></button>
          </div>,
        ])}
      />
    </section>
  );

  const analyticsPanel = (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold">Platform Analytics</h3>
      <div className="mt-4 space-y-3 text-sm">
        <AnalyticsRow label="Total businesses growth" value={`${analytics?.newBusinessesThisMonth ?? 0} new this month`} />
        <AnalyticsRow label="Bookings per day" value={`${analytics?.bookingsToday ?? 0} today`} />
        <AnalyticsRow label="New businesses per month" value={`${analytics?.newBusinessesThisMonth ?? 0} this month`} />
        <AnalyticsRow label="Booking statuses overview" value={`${analytics?.pendingBookings ?? 0} pending / ${analytics?.confirmedBookings ?? 0} confirmed / ${analytics?.completedBookings ?? 0} completed`} />
        <div className="rounded-md bg-mist p-3">
          <p className="font-semibold">Most active businesses</p>
          <div className="mt-2 space-y-1 text-graphite">
            {(analytics?.mostActiveBusinesses || []).map((item) => <p key={item}>{item}</p>)}
            {!analytics?.mostActiveBusinesses?.length && <p>No booking activity yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    if (activeNav === 'Dashboard') {
      return (
        <>
          {metricGrid}
          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.72fr]">
            <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold">Platform Snapshot</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <AnalyticsRow label="Active rate" value={`${businesses.length ? Math.round((businesses.filter((business) => business.active).length / businesses.length) * 100) : 0}%`} />
                <AnalyticsRow label="Inactive" value={analytics?.inactiveBusinesses ?? 0} />
                <AnalyticsRow label="Pending" value={analytics?.pendingBookings ?? 0} />
              </div>
            </section>
            {analyticsPanel}
          </div>
        </>
      );
    }

    if (activeNav === 'Businesses') {
      return (
        <>
          {metricGrid}
          <div className="mt-6">{businessTable}</div>
          <div className="mt-6">
            <BusinessPreview
              business={selectedBusiness}
              onEdit={() => selectedBusiness && openEdit(selectedBusiness)}
              onManageServices={() => selectedBusiness && openBusinessOperations(selectedBusiness, 'services')}
              onManageStaff={() => selectedBusiness && openBusinessOperations(selectedBusiness, 'staff')}
              onManageBookings={() => selectedBusiness && openBusinessOperations(selectedBusiness, 'bookings')}
            />
          </div>
          {operationPanel && <BusinessOperationsPanel panel={operationPanel} onClose={() => setOperationPanel(null)} />}
        </>
      );
    }

    if (activeNav === 'Bookings') {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Stat icon={CalendarCheck} label="Bookings Today" value={analytics?.bookingsToday ?? 0} />
            <Stat icon={Clock} label="Pending Bookings" value={analytics?.pendingBookings ?? 0} />
            <Stat icon={Check} label="Completed Bookings" value={analytics?.completedBookings ?? 0} />
          </div>
          <section className="mt-6 rounded-lg border border-line bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold">Platform Bookings</h3>
            <p className="mt-2 text-sm text-graphite">Super admin sees platform-level booking health here. Detailed booking operations stay inside each business admin dashboard to keep tenant data separated.</p>
          </section>
        </>
      );
    }

    if (activeNav === 'Users') {
      return (
        <section className="rounded-lg border border-line bg-white shadow-sm">
          <div className="border-b border-line p-5">
            <h3 className="text-lg font-bold">Business Owner Accounts</h3>
            <p className="mt-1 text-sm text-graphite">Owner accounts are created when you add a business with owner email and a generated temporary password.</p>
          </div>
          <ResponsiveTable
            columns={['Business', 'Owner Name', 'Owner Email', 'Status', 'Action']}
            rows={businesses.map((business) => [
              business.name,
              business.ownerName || '-',
              business.ownerEmail || '-',
              business.ownerEmail ? 'Account-ready' : 'Missing owner email',
              <button className="btn-secondary px-3 py-1.5" onClick={() => openEdit(business)}>Edit Owner</button>,
            ])}
          />
        </section>
      );
    }

    if (activeNav === 'Analytics') {
      return (
        <>
          {metricGrid}
          <div className="mt-6">{analyticsPanel}</div>
        </>
      );
    }

    return (
      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold">Platform Settings</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <AnalyticsRow label="Main domain" value={window.location.origin} />
          <AnalyticsRow label="Public business URL pattern" value="/b/{business-slug}" />
          <AnalyticsRow label="Super admin" value={adminUser?.email || '-'} />
          <AnalyticsRow label="Authentication" value="JWT protected admin APIs" />
        </div>
      </section>
    );
  };

  const sectionTitle = {
    Dashboard: 'Platform Dashboard',
    Businesses: 'Businesses',
    Bookings: 'Bookings',
    Users: 'Users',
    Analytics: 'Analytics',
    'Platform Settings': 'Platform Settings',
  }[activeNav];

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f6f7f8]">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-line bg-white px-4 py-6">
          <div className="mb-8 px-2">
            <p className="text-xs font-bold uppercase tracking-wide text-graphite">Scalora</p>
            <h1 className="mt-1 text-xl font-bold">Super Admin</h1>
            <p className="mt-1 truncate text-sm text-graphite">{adminUser?.email}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map(([label, Icon]) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold ${activeNav === label ? 'bg-mist text-teal' : 'text-graphite hover:bg-[#f4f6f6] hover:text-ink'}`}
                onClick={() => setActiveNav(label)}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-graphite hover:bg-[#f4f6f6] hover:text-ink" onClick={logout}>
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </aside>

        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-coral">Multi-tenant platform</p>
              <h2 className="mt-1 text-3xl font-bold">{sectionTitle}</h2>
              <p className="mt-1 text-sm text-graphite">Manage business profiles, public links, branding, users, and platform health.</p>
            </div>
            {(activeNav === 'Dashboard' || activeNav === 'Businesses') && (
              <button className="btn-primary" onClick={openCreate}><Plus size={18} /> Add Business</button>
            )}
          </div>

          {renderContent()}
        </section>
      </div>
      {modalOpen && (
        <BusinessModal
          draft={draft}
          setDraft={setDraft}
          editing={Boolean(editingBusiness)}
          onClose={() => setModalOpen(false)}
          onSubmit={saveBusiness}
        />
      )}
    </main>
  );
}

function BusinessPreview({ business, onEdit, onManageServices, onManageStaff, onManageBookings }) {
  if (!business) {
    return (
      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <p className="text-sm text-graphite">Select a business from the table to preview its public profile details.</p>
      </section>
    );
  }
  const colors = [business.primaryColor, business.secondaryColor, business.accentColor].filter(Boolean);
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
      <div className="h-40 bg-mist bg-cover bg-center" style={{ backgroundImage: business.coverImageUrl ? `url(${business.coverImageUrl})` : undefined }} />
      <div className="p-5">
        <div className="-mt-12 mb-4 flex items-end gap-4">
          {business.logoUrl ? <img className="h-20 w-20 rounded-lg border-4 border-white object-cover shadow-sm" src={business.logoUrl} alt="" /> : <span className="flex h-20 w-20 items-center justify-center rounded-lg border-4 border-white bg-mist text-xl font-bold text-teal shadow-sm">{business.name?.slice(0, 2)?.toUpperCase()}</span>}
          <div>
            <h3 className="text-2xl font-bold">{business.name}</h3>
            <p className="text-sm text-graphite">{business.tagline}</p>
          </div>
        </div>
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p><span className="font-semibold">Public link:</span> {publicLink(business.slug)}</p>
          <p><span className="font-semibold">Status:</span> {business.active ? 'Active' : 'Inactive'}</p>
          <p><span className="font-semibold">Phone:</span> {business.phone || business.phoneNumber || '-'}</p>
          <p><span className="font-semibold">WhatsApp:</span> {business.whatsappNumber || '-'}</p>
          <p className="md:col-span-2"><span className="font-semibold">Address:</span> {business.address || '-'}</p>
          <p className="md:col-span-2"><span className="font-semibold">Opening hours:</span> {business.openingHours || '-'}</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {colors.map((color) => <span key={color} className="h-7 w-7 rounded-md border border-line" style={{ backgroundColor: color }} title={color} />)}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a className="btn-primary" href={publicLink(business.slug)} target="_blank" rel="noreferrer"><ExternalLink size={17} /> View Public Page</a>
          <button className="btn-secondary" onClick={onEdit}><Edit3 size={17} /> Edit Business</button>
          <button className="btn-secondary" onClick={onManageServices}>Manage Services</button>
          <button className="btn-secondary" onClick={onManageStaff}>Manage Staff</button>
          <button className="btn-secondary" onClick={onManageBookings}>Manage Bookings</button>
        </div>
      </div>
    </section>
  );
}

function BusinessOperationsPanel({ panel, onClose }) {
  const { business, section } = panel;
  const titles = {
    services: 'Services Management',
    staff: 'Staff Management',
    bookings: 'Bookings Management',
  };
  const ownerReady = Boolean(business.ownerEmail);
  const invite = [
    `Business: ${business.name}`,
    `Public page: ${window.location.origin}${publicLink(business.slug)}`,
    `Owner dashboard: ${window.location.origin}${adminLoginLink()}`,
    `Owner email: ${business.ownerEmail || 'not set'}`,
  ].join('\n');

  return (
    <section className="mt-6 rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-bold uppercase text-coral">{business.name}</p>
          <h3 className="mt-1 text-xl font-bold">{titles[section]}</h3>
          <p className="mt-2 text-sm leading-6 text-graphite">
            Business operations are managed from the business owner dashboard so each tenant can only access its own data.
          </p>
        </div>
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <a className="btn-primary" href={adminLoginLink()} target="_blank" rel="noreferrer">
          <ExternalLink size={17} /> Open Owner Login
        </a>
        <a className="btn-secondary" href={publicLink(business.slug)} target="_blank" rel="noreferrer">
          <ExternalLink size={17} /> View Public Page
        </a>
        <button className="btn-secondary" onClick={() => navigator.clipboard?.writeText(invite)}>
          <Copy size={17} /> Copy Owner Details
        </button>
      </div>
      <div className={`mt-4 rounded-md px-4 py-3 text-sm ${ownerReady ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
        {ownerReady
          ? `Owner account email: ${business.ownerEmail}. The owner can log in and manage ${section}.`
          : 'No owner email is set. Edit this business, add the owner email, generate a temporary password, and save.'}
      </div>
    </section>
  );
}

function AnalyticsRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-line px-3 py-2">
      <span className="font-semibold">{label}</span>
      <span className="text-graphite">{value}</span>
    </div>
  );
}

function BusinessModal({ draft, setDraft, editing, onClose, onSubmit }) {
  const [tempPassword, setTempPassword] = useState(draft.temporaryPassword || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(draft.slug));
  const update = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
      ...(field === 'name' && !slugTouched ? { slug: slugify(value) } : {}),
    }));
  };
  const updateSlug = (value) => {
    setSlugTouched(true);
    update('slug', slugify(value));
  };
  const link = publicLink(slugify(draft.slug || draft.name));
  const loginLink = adminLoginLink();
  const inviteText = [
    `Business page: ${window.location.origin}${link}`,
    `Owner dashboard: ${window.location.origin}${loginLink}`,
    `Email: ${draft.ownerEmail || 'owner email'}`,
    `Temporary password: ${tempPassword || draft.temporaryPassword || 'generate password first'}`,
  ].join('\n');
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-ink/35 px-4 py-8">
      <form onSubmit={onSubmit} className="mx-auto max-w-5xl rounded-lg border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-xl font-bold">{editing ? 'Edit Business' : 'Add Business'}</h2>
            <p className="text-sm text-graphite">Create the tenant profile. Schedules stay inside the business admin dashboard.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal"><X /></button>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <div className="space-y-3">
            <input placeholder="Business Name" value={draft.name} onChange={(event) => update('name', event.target.value)} required />
            <input placeholder="business-name" value={draft.slug} onChange={(event) => updateSlug(event.target.value)} required />
            <div className="rounded-md border border-line bg-mist p-3 text-sm">
              <p className="text-xs font-bold uppercase text-graphite">Public business page</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="break-all font-mono">{window.location.origin}{link}</span>
                <button type="button" className="ml-auto text-teal" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${link}`)}><Copy size={16} /></button>
                <a className="text-teal" href={link} target="_blank" rel="noreferrer"><ExternalLink size={16} /></a>
              </div>
            </div>
            <div className="rounded-md border border-line bg-white p-3 text-sm">
              <p className="text-xs font-bold uppercase text-graphite">Business owner dashboard login</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="break-all font-mono">{window.location.origin}{loginLink}</span>
                <button type="button" className="ml-auto text-teal" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${loginLink}`)}><Copy size={16} /></button>
              </div>
              <p className="mt-2 text-xs text-graphite">The owner signs in here with their owner email and temporary password, then sees only their business dashboard.</p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-line bg-mist px-3 py-2 text-sm">
              <span className="truncate text-graphite">Copy owner invite</span>
              <button type="button" className="ml-auto text-teal" onClick={() => navigator.clipboard?.writeText(inviteText)}><Copy size={16} /></button>
              <button type="button" className="btn-secondary px-3 py-1.5" onClick={() => navigator.clipboard?.writeText(inviteText)}>Copy Details</button>
            </div>
            <input placeholder="Tagline" value={draft.tagline} onChange={(event) => update('tagline', event.target.value)} />
            <textarea placeholder="Description" rows="4" value={draft.description} onChange={(event) => update('description', event.target.value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="Phone" value={draft.phone} onChange={(event) => update('phone', event.target.value)} />
              <input placeholder="WhatsApp" value={draft.whatsappNumber} onChange={(event) => update('whatsappNumber', event.target.value)} />
              <input type="email" placeholder="Email" value={draft.email} onChange={(event) => update('email', event.target.value)} />
              <input placeholder="Opening Hours" value={draft.openingHours} onChange={(event) => update('openingHours', event.target.value)} />
            </div>
            <input placeholder="Address" value={draft.address} onChange={(event) => update('address', event.target.value)} />
            <input placeholder="Google Maps URL" value={draft.googleMapsUrl} onChange={(event) => update('googleMapsUrl', event.target.value)} />
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <UploadField label="Upload Logo" icon={Upload} value={draft.logoUrl} onChange={(value) => update('logoUrl', value)} />
              <UploadField label="Upload Cover" icon={ImagePlus} value={draft.coverImageUrl} onChange={(value) => update('coverImageUrl', value)} />
              <UploadField label="Gallery Images" icon={ImagePlus} value={draft.galleryImageUrls} onChange={(value) => update('galleryImageUrls', value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="color" title="Primary Color" value={draft.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} />
              <input type="color" title="Secondary Color" value={draft.secondaryColor} onChange={(event) => update('secondaryColor', event.target.value)} />
              <input type="color" title="Accent Color" value={draft.accentColor} onChange={(event) => update('accentColor', event.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={draft.fontStyle} onChange={(event) => update('fontStyle', event.target.value)}>
                <option>Inter</option>
                <option>System UI</option>
                <option>Georgia</option>
              </select>
              <select value={draft.buttonStyle} onChange={(event) => update('buttonStyle', event.target.value)}>
                <option value="rounded">Rounded</option>
                <option value="pill">Pill</option>
                <option value="sharp">Sharp</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="Instagram URL" value={draft.instagramUrl} onChange={(event) => update('instagramUrl', event.target.value)} />
              <input placeholder="Facebook URL" value={draft.facebookUrl} onChange={(event) => update('facebookUrl', event.target.value)} />
              <input placeholder="TikTok URL" value={draft.tiktokUrl} onChange={(event) => update('tiktokUrl', event.target.value)} />
              <select value={draft.active ? 'true' : 'false'} onChange={(event) => update('active', event.target.value === 'true')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="Business Owner Name" value={draft.ownerName} onChange={(event) => update('ownerName', event.target.value)} />
              <input type="email" placeholder="Business Owner Email" value={draft.ownerEmail} onChange={(event) => update('ownerEmail', event.target.value)} />
            </div>
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => {
                const generated = Math.random().toString(36).slice(2, 10) + 'A!9';
                setTempPassword(generated);
                update('temporaryPassword', generated);
                navigator.clipboard?.writeText(generated);
              }}
            >
              Generate temporary password
            </button>
            {tempPassword && <input readOnly value={tempPassword} aria-label="Generated temporary password" />}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary">{editing ? 'Save Changes' : 'Create Business'}</button>
        </div>
      </form>
    </div>
  );
}

function UploadField({ label, icon: Icon, value, onChange }) {
  const isGallery = label.includes('Gallery');
  const images = isGallery ? imageList(value) : (value ? [value] : []);
  const handleFiles = (files) => {
    const selected = Array.from(files || []);
    if (!selected.length) return;
    Promise.all(selected.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }))).then((results) => {
      onChange(isGallery ? JSON.stringify([...images, ...results]) : results[0]);
    });
  };

  return (
    <div className="rounded-lg border border-dashed border-line bg-mist/60 p-3 text-center">
      <label className="block cursor-pointer normal-case tracking-normal">
        <Icon className="mx-auto mb-2 text-teal" size={20} />
        <span className="block text-xs font-bold text-ink">{label}</span>
        <span className="mt-1 block text-[11px] text-graphite">Choose image file</span>
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          multiple={isGallery}
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {images.slice(0, isGallery ? 4 : 1).map((image, index) => (
            <img key={`${image}-${index}`} className="h-16 w-full rounded-md object-cover" src={image} alt={`${label} preview`} />
          ))}
        </div>
      )}
      {images.length > 0 && (
        <button type="button" className="mt-3 text-xs font-semibold text-coral" onClick={() => onChange('')}>
          Remove
        </button>
      )}
    </div>
  );
}

function AdminDashboard({ setToken, adminUser, setAdminUser, services, setServices, testimonials, setTestimonials, businessInfo, setBusinessInfo, businesses, setBusinesses }) {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [businessDraft, setBusinessDraft] = useState({
    name: '',
    slug: '',
    tagline: '',
    active: true,
    logoUrl: '',
    coverImageUrl: '',
    galleryImageUrls: '',
    phoneNumber: '',
    whatsappNumber: '',
    address: '',
    openingHours: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
  });
  const [availabilityDraft, setAvailabilityDraft] = useState({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', capacity: 1, active: true });
  const [filters, setFilters] = useState({ status: '', date: '', serviceId: '' });
  const [serviceDraft, setServiceDraft] = useState({ name: '', description: '', durationMinutes: 60, price: 80, active: true });
  const [staffDraft, setStaffDraft] = useState({ name: '', role: '', email: '', phoneNumber: '', active: true });
  const [testimonialDraft, setTestimonialDraft] = useState({ customerName: '', content: '', rating: 5, active: true });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [editingAvailabilityId, setEditingAvailabilityId] = useState(null);
  const isSuperAdmin = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'ADMIN';

  const loadAdminData = () => {
    api.getAdminBusinesses().then((items) => {
      setBusinesses(items);
      if (!selectedBusinessId && items[0]?.id) setSelectedBusinessId(String(items[0].id));
    }).catch(() => {});
    if (!selectedBusinessId) return;
    if (isSuperAdmin) {
      api.getAdminBusinessInfo(selectedBusinessId).then((info) => setBusinessInfo({ ...fallbackBusiness, ...info })).catch(() => {});
      return;
    }
    const scope = { ...filters, businessId: selectedBusinessId };
    api.getBookings(scope).then(setBookings).catch(() => setBookings([]));
    api.getBookings({ businessId: selectedBusinessId }).then(setAllBookings).catch(() => setAllBookings([]));
    api.getStaff(selectedBusinessId).then(setStaff).catch(() => setStaff([]));
    api.getAdminServices(selectedBusinessId).then(setServices).catch(() => {});
    api.getAdminTestimonials(selectedBusinessId).then(setTestimonials).catch(() => {});
    api.getAdminBusinessInfo(selectedBusinessId).then((info) => setBusinessInfo({ ...fallbackBusiness, ...info })).catch(() => {});
    api.getAvailability(selectedBusinessId).then(setAvailability).catch(() => setAvailability([]));
  };

  useEffect(loadAdminData, [filters.status, filters.date, filters.serviceId, selectedBusinessId, isSuperAdmin]);

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
    const profile = {
      businessName: businessDraft.name,
      logoUrl: businessDraft.logoUrl,
      coverImageUrl: businessDraft.coverImageUrl,
      galleryImageUrls: businessDraft.galleryImageUrls,
      phoneNumber: businessDraft.phoneNumber,
      whatsappNumber: businessDraft.whatsappNumber,
      address: businessDraft.address,
      openingHours: businessDraft.openingHours,
      facebookUrl: businessDraft.facebookUrl,
      instagramUrl: businessDraft.instagramUrl,
      linkedinUrl: businessDraft.linkedinUrl,
    };
    const created = await api.createBusiness({
      name: businessDraft.name,
      slug: businessDraft.slug,
      tagline: businessDraft.tagline,
      active: businessDraft.active,
    });
    await api.updateBusinessInfo(profile, created.id);
    setBusinesses((current) => [...current, created]);
    setSelectedBusinessId(String(created.id));
    setBusinessDraft({
      name: '',
      slug: '',
      tagline: '',
      active: true,
      logoUrl: '',
      coverImageUrl: '',
      galleryImageUrls: '',
      phoneNumber: '',
      whatsappNumber: '',
      address: '',
      openingHours: '',
      facebookUrl: '',
      instagramUrl: '',
      linkedinUrl: '',
    });
  };

  const updateSelectedBusiness = async () => {
    const selected = businesses.find((business) => String(business.id) === String(selectedBusinessId));
    if (!selected) return;
    const updated = await api.updateBusiness(selected.id, {
      name: selected.name,
      slug: selected.slug,
      tagline: selected.tagline || '',
      active: selected.active,
    });
    setBusinesses((current) => current.map((business) => (business.id === updated.id ? updated : business)));
    setBusinessInfo(await api.updateBusinessInfo(businessInfo, selected.id));
  };

  const deleteSelectedBusiness = async () => {
    if (!selectedBusinessId) return;
    await api.deleteBusiness(selectedBusinessId);
    setBusinesses((current) => current.filter((business) => String(business.id) !== String(selectedBusinessId)));
    setSelectedBusinessId('');
    setBusinessInfo(fallbackBusiness);
  };

  const saveAvailability = async () => {
    const payload = { ...availabilityDraft, capacity: Number(availabilityDraft.capacity) };
    const saved = editingAvailabilityId
      ? await api.updateAvailability(editingAvailabilityId, payload)
      : await api.createAvailability(payload, selectedBusinessId);
    setAvailability((current) => editingAvailabilityId
      ? current.map((item) => (item.id === saved.id ? saved : item))
      : [...current, saved]);
    setEditingAvailabilityId(null);
    setAvailabilityDraft({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', capacity: 1, active: true });
  };

  if (isSuperAdmin) {
    return (
      <SuperAdminDashboard
        setToken={setToken}
        setAdminUser={setAdminUser}
        adminUser={adminUser}
        businesses={businesses}
        setBusinesses={setBusinesses}
      />
    );
  }

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
        {isSuperAdmin ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Stat icon={BarChart3} label="Businesses" value={businesses.length} />
            <Stat icon={Check} label="Active" value={businesses.filter((business) => business.active).length} />
            <Stat icon={Clock} label="Inactive" value={businesses.filter((business) => !business.active).length} />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <Stat icon={BarChart3} label="Total" value={stats.total} />
            <Stat icon={Clock} label="Pending" value={stats.pending} />
            <Stat icon={CalendarCheck} label="Confirmed" value={stats.confirmed} />
            <Stat icon={Check} label="Completed" value={stats.completed} />
          </div>
        )}

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
                <select value={businessDraft.active ? 'true' : 'false'} onChange={(event) => setBusinessDraft({ ...businessDraft, active: event.target.value === 'true' })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <input placeholder="Logo URL" value={businessDraft.logoUrl} onChange={(event) => setBusinessDraft({ ...businessDraft, logoUrl: event.target.value })} />
                <input placeholder="Cover image URL" value={businessDraft.coverImageUrl} onChange={(event) => setBusinessDraft({ ...businessDraft, coverImageUrl: event.target.value })} />
                <input placeholder="Gallery URLs, comma-separated" value={businessDraft.galleryImageUrls} onChange={(event) => setBusinessDraft({ ...businessDraft, galleryImageUrls: event.target.value })} />
                <input placeholder="Phone" value={businessDraft.phoneNumber} onChange={(event) => setBusinessDraft({ ...businessDraft, phoneNumber: event.target.value })} />
                <input placeholder="WhatsApp" value={businessDraft.whatsappNumber} onChange={(event) => setBusinessDraft({ ...businessDraft, whatsappNumber: event.target.value })} />
                <input placeholder="Address" value={businessDraft.address} onChange={(event) => setBusinessDraft({ ...businessDraft, address: event.target.value })} />
                <input placeholder="Opening hours" value={businessDraft.openingHours} onChange={(event) => setBusinessDraft({ ...businessDraft, openingHours: event.target.value })} />
              </div>
            ) : (
              <div className="rounded-md bg-mist px-4 py-3 text-sm text-graphite">
                Business admins can manage bookings, services, staff, testimonials, and profile details for their assigned business only.
              </div>
            )}
          </div>
        </section>

        {isSuperAdmin && (
          <section className="mt-8 rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Selected Business Profile</h2>
            {selectedBusinessId ? (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {['name', 'slug', 'tagline'].map((key) => {
                    const selected = businesses.find((business) => String(business.id) === String(selectedBusinessId)) || {};
                    return (
                      <input
                        key={key}
                        placeholder={key}
                        value={selected[key] || ''}
                        onChange={(event) => setBusinesses((current) => current.map((business) => (
                          String(business.id) === String(selectedBusinessId) ? { ...business, [key]: event.target.value } : business
                        )))}
                      />
                    );
                  })}
                  <select
                    value={(businesses.find((business) => String(business.id) === String(selectedBusinessId))?.active ?? true) ? 'true' : 'false'}
                    onChange={(event) => setBusinesses((current) => current.map((business) => (
                      String(business.id) === String(selectedBusinessId) ? { ...business, active: event.target.value === 'true' } : business
                    )))}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  {Object.keys(fallbackBusiness).map((key) => (
                    <input
                      key={key}
                      placeholder={key}
                      value={businessInfo[key] || ''}
                      onChange={(event) => setBusinessInfo({ ...businessInfo, [key]: event.target.value })}
                    />
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button className="btn-primary" onClick={updateSelectedBusiness}><Save size={18} /> Save Business</button>
                  <button className="btn-secondary border-coral text-coral" onClick={deleteSelectedBusiness}><Trash2 size={18} /> Delete Business</button>
                </div>
              </>
            ) : (
              <p className="text-sm text-graphite">Create or select a business to edit its profile.</p>
            )}
          </section>
        )}

        {isSuperAdmin && <BusinessDirectory businesses={businesses} />}

        {!isSuperAdmin && (
          <>

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
          <Manager title="Availability" icon={CalendarCheck} onSave={saveAvailability} saveLabel={editingAvailabilityId ? 'Update Availability' : 'Save Availability'}>
            <select value={availabilityDraft.dayOfWeek} onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, dayOfWeek: event.target.value })}>
              {weekdays.map((day) => <option key={day} value={day}>{day}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-3">
              <input type="time" value={availabilityDraft.startTime} onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, startTime: event.target.value })} />
              <input type="time" value={availabilityDraft.endTime} onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, endTime: event.target.value })} />
              <input type="number" min="1" value={availabilityDraft.capacity} onChange={(event) => setAvailabilityDraft({ ...availabilityDraft, capacity: event.target.value })} />
            </div>
            <MiniList
              items={availability}
              label={(item) => `${item.dayOfWeek} ${item.startTime}-${item.endTime} cap ${item.capacity}`}
              onEdit={(item) => {
                setEditingAvailabilityId(item.id);
                setAvailabilityDraft({ dayOfWeek: item.dayOfWeek, startTime: item.startTime, endTime: item.endTime, capacity: item.capacity, active: item.active });
              }}
              onDelete={async (id) => {
                await api.deleteAvailability(id);
                setAvailability((current) => current.filter((item) => item.id !== id));
                if (editingAvailabilityId === id) setEditingAvailabilityId(null);
              }}
            />
          </Manager>

          <Manager title="Services" icon={Edit3} draft={serviceDraft} setDraft={setServiceDraft} onSave={saveService} saveLabel={editingServiceId ? 'Update Service' : 'Save Services'}>
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

          <Manager title="Staff" icon={Users} onSave={saveStaff} saveLabel={editingStaffId ? 'Update Staff' : 'Save Staff'}>
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

          <Manager title="Testimonials" icon={Star} onSave={saveTestimonial} saveLabel={editingTestimonialId ? 'Update Testimonial' : 'Save Testimonials'}>
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
          </>
        )}
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

function Manager({ title, icon: Icon, onSave, saveLabel, children }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Icon className="text-teal" />
      </div>
      <div className="space-y-3">{children}</div>
      <button className="btn-primary mt-4 w-full" onClick={onSave}><Plus size={18} /> {saveLabel || `Save ${title}`}</button>
    </section>
  );
}

function MiniList({ items, label, onEdit, onDelete }) {
  return (
    <div className="max-h-44 overflow-auto rounded-md border border-line">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 border-b border-line px-3 py-2 text-sm last:border-0">
          <span className="truncate">{label(item)}</span>
          {(onEdit || onDelete) && (
            <span className="flex items-center gap-2">
              {onEdit && <button className="text-teal" onClick={() => onEdit(item)} aria-label="Edit item"><Edit3 size={16} /></button>}
              {onDelete && <button className="text-coral" onClick={() => onDelete(item.id)} aria-label="Delete item"><Trash2 size={16} /></button>}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
