import { useEffect, useMemo, useState } from 'react';
import bedroomPhoto from '@assets/generated_images/jj-hostel-placeholder-bedroom.jpg';
import commonRoomPhoto from '@assets/generated_images/jj-hostel-placeholder-common-room.jpg';
import exteriorPhoto from '@assets/generated_images/jj-hostel-placeholder-exterior.jpg';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
const STORAGE_KEY = 'jj-hostel-demo-complaints';
const NOTICES_KEY = 'jj-hostel-demo-notices';
const ROOMS_KEY = 'jj-hostel-demo-rooms';
const SESSION_KEY = 'jj-hostel-manager-session';
const THEME_KEY = 'jj-hostel-demo-theme';
// Replace these demo contact details with the hostel's confirmed information.
const HOSTEL_PHONE = '+233 XX XXX XXXX';
const HOSTEL_EMAIL = 'manager@example.com';
const HOSTEL_MAP_URL = 'https://maps.app.goo.gl/ysz6p45BvRzKDSc47';
const issueCategories = ['Plumbing', 'Electrical', 'Carpentry', 'General'];
const roomNames = Array.from({ length: 67 }, (_, index) => `Room ${index + 1}`);
const sampleReports = [
  { id: 'sample-report-1', room: 'Room 4', category: 'Plumbing', description: 'The shower tap keeps dripping after it is turned off.', date: 'Demo sample', status: 'New' },
  { id: 'sample-report-2', room: 'Room 19', category: 'Electrical', description: 'The reading light beside the desk is not working.', date: 'Demo sample', status: 'In progress' },
  { id: 'sample-report-3', room: 'Room 42', category: 'Carpentry', description: 'The wardrobe door hinge has come loose.', date: 'Demo sample', status: 'New' },
];
const initialNotices = [
  { id: 'notice-water', tag: 'WATER', title: 'Water maintenance on Friday', body: 'Water service may be interrupted from 8:00 am while the storage tanks are serviced. Please store enough water beforehand; normal supply is expected by midday.', date: 'MANAGER NOTICE' },
  { id: 'notice-checkout', tag: 'CHECKOUT', title: 'End-of-semester checkout rules', body: 'Please return your room key to the manager, clear personal belongings, and leave the room tidy before checkout. Confirm your departure time in advance.', date: 'END OF SEMESTER' },
  { id: 'notice-quiet', tag: 'COMMUNITY', title: 'Quiet hours begin at 10:00 pm', body: 'Please keep noise low in shared spaces during study hours and overnight so everyone can rest and focus.', date: 'HOUSE REMINDER' },
];
const initialRooms = Array.from({ length: 67 }, (_, index) => ({
  number: index + 1,
  status: [1, 4, 7, 12, 18, 22, 29, 34, 41, 48, 55, 62].includes(index + 1) ? 'Available' : 'Occupied',
}));

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value) return JSON.parse(value);
  } catch {
    // Keep the demo usable in a browser where storage is unavailable.
  }
  return fallback;
}
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // State remains available until this tab is closed.
  }
}
function readReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return sampleReports;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return sampleReports;
    return stored.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const report = item;
      if (!roomNames.includes(String(report.room)) || !report.description || !report.category) return [];
      return [{
        id: report.id || `report-${Date.now()}-${Math.random()}`,
        room: String(report.room),
        category: String(report.category),
        description: String(report.description),
        date: report.date || 'Previously submitted',
        status: report.status === 'Resolved' || report.status === 'In progress' ? report.status : 'New',
      }];
    });
  } catch {
    return sampleReports;
  }
}
const complaintSchema = z.object({
  room: z.string().refine((value) => roomNames.includes(value), 'Choose a room from the list.'),
  category: z.string().refine((value) => issueCategories.includes(value), 'Choose a listed category.'),
  description: z.string().trim().min(1, 'Describe the issue.'),
});

const publicNavItems = [
  { href: '/', label: 'Home' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/report', label: 'Report an issue' },
  { href: '/manager', label: 'Manager access' },
];
const managerNavItems = [
  { href: '#manager-overview', label: 'Overview' },
  { href: '#manager-reports', label: 'Visitor reports' },
  { href: '#manager-notices', label: 'Notice board' },
  { href: '#manager-rooms', label: 'Room availability' },
];

function AppShell({ children, managerMode, onSignOut }) {
  const [location] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) === 'dark'; } catch { return false; }
  });
  useEffect(() => setMobileMenu(false), [location]);
  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light'); } catch { /* The selected theme remains active for this visit. */ }
  }, [darkMode]);
  const phoneIsPlaceholder = HOSTEL_PHONE.includes('X');
  const emailIsPlaceholder = HOSTEL_EMAIL.endsWith('@example.com');
  function renderNavItems(mobile) {
    const linkClass = mobile
      ? 'block border-b border-[#d5cebf] px-2 py-3 text-sm font-semibold text-[#625e54]'
      : 'border-b-2 border-transparent px-3 py-3 text-[12px] font-semibold text-[#625e54]';
    if (managerMode) {
      return <>
        {managerNavItems.map(({ href, label }) => <a key={href} href={href}
          data-testid={`${mobile ? 'link-mobile' : 'link-nav'}-${label.toLowerCase().replaceAll(' ', '-')}`}
          onClick={() => setMobileMenu(false)} className={linkClass}>{label}</a>)}
        <button type="button" onClick={onSignOut}
          data-testid={mobile ? 'button-mobile-sign-out' : 'button-nav-sign-out'}
          className={mobile
            ? 'mt-3 w-full border border-[#234633] px-3 py-3 text-left text-sm font-bold text-[#234633]'
            : 'ml-1 border border-[#234633] px-3 py-2.5 text-[12px] font-bold text-[#234633]'}>
          Sign out
        </button>
      </>;
    }
    return publicNavItems.map(({ href, label }) => <Link key={href} href={href}
      data-testid={`${mobile ? 'link-mobile' : 'link-nav'}-${label.toLowerCase().replaceAll(' ', '-')}`}
      className={`${linkClass} ${location === href ? 'border-[#9a563d] text-[#234633]' : ''}`}>
      {label}
    </Link>);
  }
  return <div className={`${darkMode ? 'dark' : ''} min-h-[100dvh] bg-[#eee9dd] text-[#1d3529]`} style={{ colorScheme: darkMode ? 'dark' : 'light' }}>
    <header className="sticky top-0 z-40 border-b border-[#c9c1b1] bg-[#eee9dd]">
      <div className="mx-auto flex min-h-[76px] max-w-[1240px] items-center justify-between px-5 md:px-9">
        <Link href="/" className="flex items-center gap-3" data-testid="link-home-brand">
          <span className="flex h-10 w-10 items-center justify-center border border-[#234633] text-[15px] font-bold tracking-[-.08em] text-[#234633]">J&amp;J</span>
          <span className="leading-tight">
            <span className="serif block text-[19px] font-bold tracking-[-.035em] text-[#20392b]">J &amp; J Hostel</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.19em] text-[#775344]">A good place to grow</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex" aria-label={managerMode ? 'Manager navigation' : 'Main navigation'}>
            {renderNavItems(false)}
          </nav>
          <button type="button" onClick={() => setDarkMode((current) => !current)} aria-pressed={darkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} data-testid="button-theme-toggle"
            className="flex h-10 items-center border border-[#8e9a8b] px-2.5 text-[10px] font-bold uppercase tracking-wide text-[#234633] focus:outline-none focus:ring-2 focus:ring-[#53745b] sm:px-3">
            <span className="sm:hidden">{darkMode ? 'Light' : 'Dark'}</span>
            <span className="hidden sm:inline">{darkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button type="button" onClick={() => setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu}
            aria-label={mobileMenu ? 'Close navigation menu' : 'Open navigation menu'} data-testid="button-mobile-menu"
            className="flex h-10 items-center border border-[#8e9a8b] px-3 text-[11px] font-bold uppercase tracking-wider text-[#234633] md:hidden">
            {mobileMenu ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      {mobileMenu && <nav className="border-t border-[#c9c1b1] bg-[#e8e2d5] px-5 py-3 md:hidden" aria-label={managerMode ? 'Manager navigation' : 'Mobile navigation'}>
        {renderNavItems(true)}
      </nav>}
    </header>
    <main>{children}</main>
    <footer className="mt-20 border-t border-[#c9c1b1] bg-[#e6e0d3]">
      <div className="mx-auto grid max-w-[1240px] gap-6 px-5 py-8 text-xs text-[#5d6257] sm:grid-cols-2 md:grid-cols-[1fr_1fr_auto] md:px-9">
        <div>
          <p className="font-semibold tracking-wide text-[#344638]">J &amp; J Hostel <span className="font-normal text-[#775d4c]">· Accra, Ghana</span></p>
          <p className="mt-2">A comfortable place to study and settle in.</p>
          <a href={HOSTEL_MAP_URL} target="_blank" rel="noopener noreferrer" data-testid="link-hostel-map"
            aria-label="View the J and J Hostel location on Google Maps, opens in a new tab"
            className="mt-2 inline-block border-b border-[#8e9a8b] pb-1 font-semibold text-[#344638]">View on Google Maps</a>
        </div>
        <div>
          <p className="font-bold uppercase tracking-[.14em] text-[#925039]">Contact the hostel</p>
          <p className="mt-2">Phone: {phoneIsPlaceholder
            ? <span data-testid="text-placeholder-phone">{HOSTEL_PHONE}</span>
            : <a href={`tel:${HOSTEL_PHONE.replace(/[^\d+]/g, '')}`} data-testid="link-hostel-phone">{HOSTEL_PHONE}</a>}</p>
          <p className="mt-1">Email: {emailIsPlaceholder
            ? <span data-testid="text-placeholder-email">{HOSTEL_EMAIL}</span>
            : <a href={`mailto:${HOSTEL_EMAIL}`} data-testid="link-hostel-email">{HOSTEL_EMAIL}</a>}</p>
          {(phoneIsPlaceholder || emailIsPlaceholder) && <p className="mt-2 text-[10px]">Demo details. Replace with the hostel’s confirmed contact information.</p>}
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <Link href="/terms" data-testid="link-terms" className="w-fit border-b border-[#8e9a8b] pb-1 font-semibold text-[#344638]">Terms &amp; Conditions</Link>
          <span className="text-[10px]">For the J &amp; J Hostel website demo</span>
        </div>
      </div>
    </footer>
  </div>;
}

function SectionHeading({ eyebrow, title, description }) {
  return <div className="mb-8 max-w-[650px]">
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#925039]">{eyebrow}</p>
    <h1 className="serif text-[38px] font-semibold leading-[1.08] tracking-[-.04em] text-[#20392b] sm:text-[48px]">{title}</h1>
    <p className="mt-4 max-w-[560px] text-[15px] leading-7 text-[#5e6258]">{description}</p>
  </div>;
}

function HomePage({ notices }) {
  const gallery = [
    { src: bedroomPhoto, alt: 'Sample hostel bedroom with two beds, a desk and green-trimmed windows.', title: 'A room to settle into', label: 'Bedroom' },
    { src: commonRoomPhoto, alt: 'Sample shared study room with large tables, bookshelves and open windows.', title: 'Room to study together', label: 'Shared study room' },
    { src: exteriorPhoto, alt: 'Sample hostel exterior with balconies and a leafy entrance.', title: 'A warm welcome home', label: 'Exterior' },
  ];
  return <div>
    <section className="mx-auto max-w-[1240px] px-5 pt-8 md:px-9 md:pt-12">
      <div className="relative grid overflow-hidden border border-[#1a3d2a] bg-[#1e432f] text-[#f0eadc] lg:min-h-[490px] lg:grid-cols-[1.1fr_.9fr]">
        <div className="flex flex-col justify-center px-7 py-11 sm:px-12 sm:py-14 lg:px-[72px]">
          <p className="mb-7 text-[10px] font-bold uppercase tracking-[.22em] text-[#d8b28f]">A STUDENT HOME IN ACCRA</p>
          <h1 className="serif max-w-[650px] text-[48px] font-semibold leading-[.98] tracking-[-.055em] sm:text-[66px] lg:text-[72px]">A place to settle in and find your rhythm.</h1>
          <p className="mt-6 max-w-[485px] text-[15px] leading-7 text-[#e2e4d7]">Your home base for the semester. Check room availability, catch up on what’s happening, or let us know when something needs attention.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/rooms" data-testid="link-hero-check-rooms" className="inline-flex min-h-12 items-center justify-center border border-[#f0eadc] bg-[#f0eadc] px-5 py-3 text-[13px] font-bold text-[#1e432f]">Check room availability</Link>
            <Link href="/report" data-testid="link-hero-report-issue" className="inline-flex min-h-12 items-center justify-center border border-[#bdc6b6] px-5 py-3 text-[13px] font-semibold text-[#f0eadc]">Report an issue</Link>
          </div>
        </div>
        <div className="relative hidden min-h-[390px] lg:block">
          <img src={exteriorPhoto} alt="Sample photo of the hostel exterior framed by tropical greenery." className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute bottom-5 right-5 border border-[#f0eadc]/70 bg-[#1e432f]/90 px-4 py-2 text-[9px] font-bold uppercase tracking-[.17em] text-[#f0eadc]">Temporary sample photo</div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-[1240px] px-5 py-16 md:px-9 md:py-[78px]">
      <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#c9c1b1] pb-5 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#925039]">A LOOK AROUND</p><h2 className="serif text-[35px] font-semibold tracking-[-.04em] text-[#20392b]">Spaces for living and learning</h2></div>
        <p className="max-w-[330px] text-xs leading-5 text-[#69675c]">Temporary sample imagery. Photos can be replaced with current hostel photography.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-[1.15fr_1fr_1fr]">
        {gallery.map((item, index) => <figure key={item.label} className="min-w-0">
          <div className={`relative overflow-hidden border border-[#c9c1b1] ${index === 0 ? 'aspect-[1.2] md:aspect-[1.05]' : 'aspect-[1.2]'}`}>
            <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
            <span className="absolute left-3 top-3 bg-[#eee9dd] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-[#5d5a4f]">Temporary sample photo</span>
          </div>
          <figcaption className="border-b border-[#c9c1b1] py-3"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#925039]">{item.label}</p><p className="serif mt-1 text-[20px] font-semibold text-[#20392b]">{item.title}</p></figcaption>
        </figure>)}
      </div>
    </section>
    <section className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 md:grid-cols-[.78fr_1.22fr] md:px-9 md:py-16">
      <div className="md:sticky md:top-32 md:self-start">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#925039]">THE NOTICE BOARD</p>
        <h2 className="serif text-[36px] font-semibold leading-tight tracking-[-.04em] text-[#20392b]">A few things<br />to know.</h2>
        <p className="mt-4 max-w-[300px] text-sm leading-6 text-[#5e6258]">Updates from the manager to help the house run smoothly.</p>
        <div className="mt-7 hidden items-center gap-2 text-xs font-semibold text-[#6b685d] md:flex"><span className="h-px w-8 bg-[#9a8c78]" />Updated regularly</div>
      </div>
      <div className="divide-y divide-[#c9c1b1] border-y border-[#c9c1b1]">
        {notices.length ? notices.map((notice, index) => <article key={notice.id} className="py-6 sm:py-7" data-testid={`notice-card-${index + 1}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="border border-[#b4ad9e] px-2.5 py-1 text-[9px] font-bold tracking-[.12em] text-[#465747]">{notice.tag}</span><time className="text-xs text-[#716e63]">{notice.date}</time></div>
          <h3 className="serif text-[21px] font-semibold tracking-[-.025em] text-[#263a2d] sm:text-[23px]">{notice.title}</h3>
          <p className="mt-2 max-w-[580px] text-[14px] leading-6 text-[#5e6258]">{notice.body}</p>
        </article>) : <p className="py-8 text-sm text-[#5e6258]" data-testid="empty-notices">There are no current notices.</p>}
      </div>
    </section>
    <section className="mx-auto max-w-[1240px] px-5 pb-4 md:px-9">
      <div className="flex flex-col gap-6 border-y border-[#9b9d88] bg-[#e4dfd2] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
        <div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#925039]">HERE TO HELP</p><h2 className="serif mt-2 text-[26px] font-semibold tracking-[-.035em] text-[#20392b]">Something not quite right?</h2><p className="mt-1.5 text-sm text-[#5e6258]">Tell us what’s up and we’ll take it from there.</p></div>
        <Link href="/report" data-testid="link-home-report" className="inline-flex w-fit items-center justify-center border border-[#234633] bg-[#234633] px-5 py-3 text-[13px] font-bold text-[#f0eadc]">Send a report</Link>
      </div>
    </section>
  </div>;
}

function RoomsPage({ rooms }) {
  return <div className="mx-auto max-w-[1240px] px-5 pt-12 md:px-9 md:pt-[68px]">
    <SectionHeading eyebrow="YOUR NEXT ROOM" title="Room availability" description="A clear look at Rooms 1 through 67. Availability can change, so please confirm before making plans." />
    <div className="mb-5 flex flex-wrap items-center gap-4 border-y border-[#c9c1b1] bg-[#e6e0d3] px-5 py-4">
      <span className="text-xs font-semibold text-[#454b41]">Room status</span><span className="flex items-center gap-2 text-xs text-[#4c584b]"><i className="h-2 w-2 bg-[#47704e]" />Available</span><span className="flex items-center gap-2 text-xs text-[#68655a]"><i className="h-2 w-2 bg-[#938a78]" />Occupied</span>
      <span className="ml-auto text-xs text-[#6c695f]">{rooms.filter((room) => room.status === 'Available').length} available rooms</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rooms.map((room) => <article key={room.number} data-testid={`card-room-${room.number}`} className="flex min-h-[165px] flex-col border border-[#c9c1b1] bg-[#e8e2d5] p-5">
        <div className="flex items-start justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8c553f]">ROOM</span><span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold ${room.status === 'Available' ? 'border-[#9eac98] text-[#315c3d]' : 'border-[#c4bdaf] text-[#625f55]'}`}><i className={`h-1.5 w-1.5 ${room.status === 'Available' ? 'bg-[#56815e]' : 'bg-[#999181]'}`} />{room.status}</span></div>
        <h2 className="serif mt-5 text-[25px] font-semibold tracking-[-.04em] text-[#263a2d]" data-testid={`text-room-number-${room.number}`}>Room {room.number}</h2>
        <div className="mt-auto pt-5">
          {room.status === 'Available'
            ? <a href="mailto:manager@jjhostel.com?subject=Room%20availability%20enquiry" data-testid={`link-contact-room-${room.number}`} className="flex w-full items-center justify-center border border-[#234633] bg-[#234633] px-3 py-2.5 text-[11px] font-bold text-[#f0eadc]">Contact Manager for Info</a>
            : <span className="block border-t border-[#c9c1b1] pt-3 text-[11px] font-medium text-[#716d62]">Currently occupied</span>}
        </div>
      </article>)}
    </div>
  </div>;
}

function ReportPage({ onAdd, onToast }) {
  const form = useForm({ resolver: zodResolver(complaintSchema), defaultValues: { room: '', category: '', description: '' } });
  function submitReport(values) {
    onAdd({ id: `report-${Date.now()}`, room: values.room, category: values.category, description: values.description.trim(), date: new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()), status: 'New' });
    onToast('Your report has been saved in this browser demo.');
    form.reset();
  }
  return <div className="mx-auto max-w-[1240px] px-5 pt-12 md:px-9 md:pt-[68px]">
    <div className="grid items-start gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
      <div><SectionHeading eyebrow="WE’RE LISTENING" title="Let us know what needs fixing." description="A leaking tap, a faulty light, or something else around the hostel? Send a report for the manager to review." />
        <div className="mt-10 hidden border-y border-[#c9c1b1] bg-[#e6e0d3] p-5 sm:block"><p className="text-sm font-bold text-[#344638]">Your report stays in this browser demo</p><p className="mt-1 text-xs leading-5 text-[#666459]">Include enough detail to help the manager understand the issue and where to find it.</p></div>
      </div>
      <form onSubmit={form.handleSubmit(submitReport)} className="border border-[#c9c1b1] bg-[#e8e2d5] p-6 sm:p-9" data-testid="form-complaint">
        <div className="mb-7 border-b border-[#c9c1b1] pb-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#925039]">MAINTENANCE REPORT</p><h2 className="serif mt-2 text-[25px] font-semibold tracking-[-.035em] text-[#263a2d]">What’s the issue?</h2></div>
        <div className="space-y-5">
          <div>
            <label htmlFor="report-room" className="mb-1.5 block text-[12px] font-bold text-[#454b41]">Room Number <span className="text-[#925039]">*</span></label>
            <select id="report-room" {...form.register('room')} data-testid="input-room-number" className="w-full border border-[#bdb5a5] bg-[#f0eadc] px-4 py-3 text-sm text-[#263a2d] outline-none focus:border-[#53745b] focus:ring-2 focus:ring-[#53745b]/15"><option value="">Select a room</option>{roomNames.map((room) => <option key={room} value={room}>{room}</option>)}</select>
            {form.formState.errors.room && <p className="mt-1 text-xs text-[#8b392c]">{form.formState.errors.room.message}</p>}
          </div>
          <div>
            <label htmlFor="report-category" className="mb-1.5 block text-[12px] font-bold text-[#454b41]">Issue Category <span className="text-[#925039]">*</span></label>
            <select id="report-category" {...form.register('category')} data-testid="select-issue-category" className="w-full border border-[#bdb5a5] bg-[#f0eadc] px-4 py-3 text-sm text-[#263a2d] outline-none focus:border-[#53745b] focus:ring-2 focus:ring-[#53745b]/15"><option value="">Select a category</option>{issueCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
            {form.formState.errors.category && <p className="mt-1 text-xs text-[#8b392c]">{form.formState.errors.category.message}</p>}
          </div>
          <div>
            <label htmlFor="report-description" className="mb-1.5 block text-[12px] font-bold text-[#454b41]">Complaint Description <span className="text-[#925039]">*</span></label>
            <textarea id="report-description" {...form.register('description')} rows={5} placeholder="Please describe what’s happening and where..." data-testid="input-complaint-description" className="min-h-0 w-full resize-y rounded-none border border-[#bdb5a5] bg-[#f0eadc] px-4 py-3 text-sm leading-6 text-[#263a2d] placeholder:text-[#797568] focus-visible:ring-[#53745b]/20" />
            {form.formState.errors.description && <p className="mt-1 text-xs text-[#8b392c]">{form.formState.errors.description.message}</p>}
          </div>
        </div>
        <button type="submit" data-testid="button-submit-complaint" className="mt-7 flex w-full items-center justify-center border border-[#234633] bg-[#234633] px-5 py-3.5 text-sm font-bold text-[#f0eadc] focus:outline-none focus:ring-2 focus:ring-[#53745b] focus:ring-offset-2">Send report</button>
        <p className="mt-4 text-center text-[11px] text-[#6c695f]">Please don’t include sensitive personal information.</p>
      </form>
    </div>
  </div>;
}

function ManagerLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    if (username === 'admin' && password === 'admin@123') {
      onLogin();
      setError('');
    } else setError('That username and password do not match the demo manager account.');
  }
  return <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-9 md:py-[68px]">
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_.85fr]">
      <div><SectionHeading eyebrow="MANAGER ACCESS" title="A private view for hostel operations." description="Sign in to review visitor reports, update the notice board, and manage room availability." />
        <aside className="max-w-[570px] border-y border-[#b7ad9b] bg-[#e6e0d3] p-5" data-testid="text-demo-limitation"><p className="text-sm font-bold text-[#344638]">Demo-only access gate</p><p className="mt-2 text-xs leading-5 text-[#626257]">This sign-in is for presentation only. It is not real security. Demo data is stored in this browser, and changes do not sync to other devices.</p></aside>
      </div>
      <form onSubmit={submit} className="border border-[#c9c1b1] bg-[#e8e2d5] p-6 sm:p-9" data-testid="form-manager-login">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#925039]">MANAGER SIGN IN</p><h2 className="serif mt-2 border-b border-[#c9c1b1] pb-5 text-[25px] font-semibold text-[#263a2d]">Continue to the dashboard</h2>
        <label className="mt-6 block text-[12px] font-bold text-[#454b41]" htmlFor="manager-username">Username</label>
        <input id="manager-username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} data-testid="input-manager-username" className="mt-2 h-auto w-full rounded-none border border-[#bdb5a5] bg-[#f0eadc] px-4 py-3 text-sm" required />
        <label className="mt-5 block text-[12px] font-bold text-[#454b41]" htmlFor="manager-password">Password</label>
        <input id="manager-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} data-testid="input-manager-password" className="mt-2 h-auto w-full rounded-none border border-[#bdb5a5] bg-[#f0eadc] px-4 py-3 text-sm" required />
        {error && <p className="mt-4 text-sm text-[#8b392c]" role="alert" data-testid="text-login-error">{error}</p>}
        <button type="submit" data-testid="button-manager-login" className="mt-7 w-full border border-[#234633] bg-[#234633] px-5 py-3.5 text-sm font-bold text-[#f0eadc] focus:outline-none focus:ring-2 focus:ring-[#53745b] focus:ring-offset-2">Sign in</button>
        <p className="mt-4 text-xs leading-5 text-[#666459]">Demo credentials: username <strong>admin</strong>, password <strong>admin@123</strong>.</p>
      </form>
    </div>
  </div>;
}

function ManagerPage({ complaints, onStatus, notices, onSaveNotice, onDeleteNotice, rooms, onToggleRoom }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const newCount = complaints.filter((report) => report.status === 'New').length;
  const availableCount = rooms.filter((room) => room.status === 'Available').length;
  const filteredReports = useMemo(() => complaints.filter((report) => {
    const term = search.trim().toLowerCase();
    const matchesTerm = !term || [report.room, report.category, report.description].some((value) => value.toLowerCase().includes(term));
    return matchesTerm && (statusFilter === 'All' || report.status === statusFilter);
  }), [complaints, search, statusFilter]);
  function resetNoticeForm() { setEditingId(null); setTag(''); setTitle(''); setBody(''); }
  function editNotice(notice) { setEditingId(notice.id); setTag(notice.tag); setTitle(notice.title); setBody(notice.body); }
  function submitNotice(event) {
    event.preventDefault();
    onSaveNotice({ id: editingId || `notice-${Date.now()}`, tag: tag.trim().toUpperCase(), title: title.trim(), body: body.trim(), date: new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date()) });
    resetNoticeForm();
  }
  return <div id="manager-overview" className="mx-auto max-w-[1240px] px-5 pt-10 md:px-9 md:pt-14">
    <div className="flex flex-col justify-between gap-3 border-b border-[#c9c1b1] pb-6 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#925039]">HOSTEL OPERATIONS</p><h1 className="serif text-[38px] font-semibold leading-tight tracking-[-.04em] text-[#20392b] sm:text-[48px]">Manager dashboard</h1><p className="mt-3 text-sm text-[#5e6258]">Reports, notices, and room availability for this browser demo.</p></div>
    </div>
    <div className="my-6 border-y border-[#b7ad9b] bg-[#e6e0d3] px-5 py-4 text-xs leading-5 text-[#626257]" data-testid="text-demo-limitation">Demo-only access gate. This is not real security. Data persists in this browser only and does not sync across devices.</div>
    <div className="mb-8 grid grid-cols-2 gap-3 sm:max-w-[500px]">
      <div className="border border-[#c9c1b1] bg-[#e8e2d5] p-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#68655a]">NEW REPORTS</p><p className="serif mt-2 text-[34px] font-semibold tracking-[-.05em] text-[#2c4637]" data-testid="text-new-report-count">{newCount}</p></div>
      <div className="border border-[#c9c1b1] bg-[#e8e2d5] p-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#68655a]">AVAILABLE ROOMS</p><p className="serif mt-2 text-[34px] font-semibold tracking-[-.05em] text-[#2c4637]" data-testid="text-available-room-count">{availableCount}<span className="ml-1 text-base font-medium text-[#68655a]">/ 67</span></p></div>
    </div>
    <section id="manager-reports" className="mb-10 border border-[#c9c1b1] bg-[#e8e2d5]" aria-labelledby="reports-heading">
      <div className="border-b border-[#c9c1b1] px-5 py-5 sm:px-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="reports-heading" className="serif text-[22px] font-semibold text-[#263a2d]">Visitor reports</h2><p className="mt-1 text-xs text-[#68655a]">Review each issue and update its progress.</p></div><span className="border border-[#bdb5a5] px-3 py-1.5 text-[10px] font-bold text-[#53594e]" data-testid="status-report-count">{complaints.length} reports</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_190px]">
          <label className="sr-only" htmlFor="report-search">Search reports</label><input id="report-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search room, category, or description" data-testid="input-report-search" className="h-auto w-full rounded-none border border-[#bdb5a5] bg-[#f0eadc] px-3 py-2.5 text-sm" />
          <label className="sr-only" htmlFor="report-status-filter">Filter reports by status</label><select id="report-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} data-testid="select-report-filter" className="border border-[#bdb5a5] bg-[#f0eadc] px-3 py-2.5 text-sm text-[#263a2d]"><option>All</option><option>New</option><option>In progress</option><option>Resolved</option></select>
        </div>
      </div>
      {filteredReports.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead><tr className="bg-[#ded8ca] text-[10px] font-bold uppercase tracking-[.13em] text-[#625f55]"><th className="px-5 py-3.5 sm:px-7">Room</th><th className="px-5 py-3.5">Category</th><th className="px-5 py-3.5">Description</th><th className="px-5 py-3.5">Progress</th></tr></thead>
          <tbody>{filteredReports.map((report) => <tr key={report.id} data-testid={`row-complaint-${report.id}`} className="border-t border-[#d1c9b9] align-top">
            <td className="whitespace-nowrap px-5 py-5 text-sm font-bold text-[#3a453a] sm:px-7"><span data-testid={`text-complaint-room-${report.id}`}>{report.room}</span><p className="mt-1 text-[11px] font-normal text-[#716e63]">{report.date}</p></td>
            <td className="px-5 py-5"><span className="inline-flex border border-[#c4bdaf] px-2.5 py-1 text-[10px] font-semibold text-[#50594c]" data-testid={`text-complaint-category-${report.id}`}>{report.category}</span></td>
            <td className="max-w-[430px] px-5 py-5 text-[13px] leading-5 text-[#56584f]" data-testid={`text-complaint-description-${report.id}`}>{report.description}</td>
            <td className="px-5 py-5"><label className="sr-only" htmlFor={`progress-${report.id}`}>Progress for {report.room}</label><select id={`progress-${report.id}`} value={report.status} onChange={(event) => onStatus(report.id, event.target.value)} data-testid={`select-report-progress-${report.id}`} className="min-w-[125px] border border-[#bdb5a5] bg-[#f0eadc] px-3 py-2 text-xs font-semibold text-[#263a2d]"><option>New</option><option>In progress</option><option>Resolved</option></select></td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="px-6 py-12 text-center" data-testid="empty-reports"><p className="text-sm font-bold text-[#4c5147]">{complaints.length ? 'No matching reports' : 'All quiet for now'}</p><p className="mt-1 text-xs text-[#666459]">{complaints.length ? 'Try a different search or status filter.' : 'Visitor reports will appear here when submitted.'}</p></div>}
    </section>
    <section id="manager-notices" className="mb-10 grid gap-8 lg:grid-cols-[.85fr_1.15fr]" aria-labelledby="notices-heading">
      <div className="border border-[#c9c1b1] bg-[#e8e2d5] p-5 sm:p-7">
        <h2 id="notices-heading" className="serif text-[22px] font-semibold text-[#263a2d]">{editingId ? 'Edit announcement' : 'Add an announcement'}</h2>
        <p className="mt-1 text-xs text-[#68655a]">Published announcements appear on the public home page.</p>
        <form onSubmit={submitNotice} className="mt-5 space-y-4" data-testid="form-notice">
          <div><label className="mb-1.5 block text-xs font-bold text-[#454b41]" htmlFor="notice-tag">Label</label><input id="notice-tag" value={tag} onChange={(event) => setTag(event.target.value)} maxLength={24} required data-testid="input-notice-tag" className="h-auto w-full rounded-none border border-[#bdb5a5] bg-[#f0eadc] px-3 py-2.5 text-sm" /></div>
          <div><label className="mb-1.5 block text-xs font-bold text-[#454b41]" htmlFor="notice-title">Announcement title</label><input id="notice-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={90} required data-testid="input-notice-title" className="h-auto w-full rounded-none border border-[#bdb5a5] bg-[#f0eadc] px-3 py-2.5 text-sm" /></div>
          <div><label className="mb-1.5 block text-xs font-bold text-[#454b41]" htmlFor="notice-body">Announcement details</label><textarea id="notice-body" value={body} onChange={(event) => setBody(event.target.value)} rows={4} maxLength={500} required data-testid="input-notice-body" className="w-full resize-y rounded-none border border-[#bdb5a5] bg-[#f0eadc] px-3 py-2.5 text-sm" /></div>
          <div className="flex flex-wrap gap-2"><button type="submit" data-testid="button-save-notice" className="border border-[#234633] bg-[#234633] px-4 py-2.5 text-xs font-bold text-[#f0eadc]">{editingId ? 'Save changes' : 'Publish announcement'}</button>{editingId && <button type="button" onClick={resetNoticeForm} data-testid="button-cancel-notice-edit" className="border border-[#8e9a8b] px-4 py-2.5 text-xs font-bold text-[#344638]">Cancel edit</button>}</div>
        </form>
      </div>
      <div className="border border-[#c9c1b1] bg-[#e8e2d5]">
        <div className="border-b border-[#c9c1b1] px-5 py-5 sm:px-7"><h2 className="serif text-[22px] font-semibold text-[#263a2d]">Published notices</h2><p className="mt-1 text-xs text-[#68655a]">{notices.length} announcements on the public board</p></div>
        {notices.length ? <div className="divide-y divide-[#d1c9b9]">{notices.map((notice) => <article key={notice.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-7" data-testid={`manager-notice-${notice.id}`}><div className="min-w-0"><span className="text-[9px] font-bold uppercase tracking-[.13em] text-[#925039]">{notice.tag}</span><h3 className="serif mt-1 text-lg font-semibold text-[#263a2d]">{notice.title}</h3><p className="mt-1 text-xs leading-5 text-[#5e6258]">{notice.body}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => editNotice(notice)} data-testid={`button-edit-notice-${notice.id}`} className="border border-[#8e9a8b] px-3 py-2 text-[11px] font-bold text-[#344638]">Edit</button><button type="button" onClick={() => { onDeleteNotice(notice.id); if (editingId === notice.id) resetNoticeForm(); }} data-testid={`button-delete-notice-${notice.id}`} className="border border-[#bda99d] px-3 py-2 text-[11px] font-bold text-[#824637]">Delete</button></div></article>)}</div> : <p className="px-6 py-10 text-center text-sm text-[#666459]">No announcements yet.</p>}
      </div>
    </section>
    <section id="manager-rooms" className="mb-16 border border-[#c9c1b1] bg-[#e8e2d5]" aria-labelledby="rooms-heading">
      <div className="border-b border-[#c9c1b1] px-5 py-5 sm:px-7"><h2 id="rooms-heading" className="serif text-[22px] font-semibold text-[#263a2d]">Room availability</h2><p className="mt-1 text-xs text-[#68655a]">Toggle any room between Available and Occupied. Room numbering stays 1 through 67.</p></div>
      <div className="grid grid-cols-2 gap-px bg-[#c9c1b1] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {rooms.map((room) => <div key={room.number} className="flex items-center justify-between gap-2 bg-[#e8e2d5] px-3 py-3" data-testid={`manager-room-${room.number}`}><span className="text-xs font-semibold text-[#354638]">Room {room.number}</span><button type="button" onClick={() => onToggleRoom(room.number)} aria-label={`Set Room ${room.number} ${room.status === 'Available' ? 'Occupied' : 'Available'}`} aria-pressed={room.status === 'Available'} data-testid={`button-toggle-room-${room.number}`} className={`min-w-[82px] border px-2 py-1.5 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-[#53745b] ${room.status === 'Available' ? 'border-[#9eac98] text-[#315c3d]' : 'border-[#c4bdaf] text-[#625f55]'}`}>{room.status}</button></div>)}
      </div>
    </section>
  </div>;
}

function TermsPage() {
  return <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-9 md:py-[68px]">
    <SectionHeading eyebrow="SITE INFORMATION" title="Terms & Conditions" description="Please read these terms before using the J & J Hostel website." />
    <div className="max-w-[820px] divide-y divide-[#c9c1b1] border-y border-[#c9c1b1]">
      <section className="py-6">
        <h2 className="serif text-[20px] font-semibold text-[#20392b]">1. Demonstration website</h2>
        <p className="mt-2 text-sm leading-6 text-[#5e6258]">This version is an interactive demo, not an official booking or resident-management service. Room availability, notices, and contact details may be sample information. Confirm current details directly with hostel management before making plans or payments.</p>
      </section>
      <section className="py-6">
        <h2 className="serif text-[20px] font-semibold text-[#20392b]">2. Maintenance reports</h2>
        <p className="mt-2 text-sm leading-6 text-[#5e6258]">Reports submitted in this demo are saved in the browser being used and are not delivered to hostel management or shared with other devices. For real or urgent issues, contact the hostel directly using its confirmed contact details. Do not include sensitive personal information in a report.</p>
      </section>
      <section className="py-6">
        <h2 className="serif text-[20px] font-semibold text-[#20392b]">3. Appropriate use</h2>
        <p className="mt-2 text-sm leading-6 text-[#5e6258]">Use the website respectfully and provide accurate information. Do not attempt to disrupt the service, access another person’s information, or misuse its forms.</p>
      </section>
      <section className="py-6">
        <h2 className="serif text-[20px] font-semibold text-[#20392b]">4. Review before live use</h2>
        <p className="mt-2 text-sm leading-6 text-[#5e6258]">These terms are draft wording for the website demo. Hostel management should review and approve the final terms and contact details before the site is used as a live service.</p>
      </section>
    </div>
    <Link href="/" data-testid="link-terms-home" className="mt-7 inline-flex border border-[#234633] bg-[#234633] px-5 py-3 text-sm font-bold text-[#f0eadc]">Back to home</Link>
  </div>;
}

function NotFoundPage() {
  return <div className="mx-auto max-w-[1240px] px-5 py-24 text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#925039]">NOT FOUND</p><h1 className="serif mt-3 text-4xl font-semibold text-[#20392b]">We can’t find that page.</h1><Link href="/" data-testid="link-not-found-home" className="mt-6 inline-flex border border-[#234633] bg-[#234633] px-5 py-3 text-sm font-bold text-[#f0eadc]">Back home</Link></div>;
}

function Router() {
  const [location, setLocation] = useLocation();
  const [complaints, setComplaints] = useState(readReports);
  const [notices, setNotices] = useState(() => readStorage(NOTICES_KEY, initialNotices));
  const [rooms, setRooms] = useState(() => {
    const saved = readStorage(ROOMS_KEY, initialRooms);
    return Array.from({ length: 67 }, (_, index) => {
      const room = saved.find((item) => item.number === index + 1);
      return { number: index + 1, status: room?.status === 'Available' ? 'Available' : 'Occupied' };
    });
  });
  const [managerAuthenticated, setManagerAuthenticated] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === 'signed-in'; } catch { return false; }
  });
  const [toastMessage, setToastMessage] = useState('');
  useEffect(() => {
    if (location === '/manager') return;
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* The manager view is already hidden outside its route. */ }
    setManagerAuthenticated(false);
  }, [location]);
  useEffect(() => writeStorage(STORAGE_KEY, complaints), [complaints]);
  useEffect(() => writeStorage(NOTICES_KEY, notices), [notices]);
  useEffect(() => writeStorage(ROOMS_KEY, rooms), [rooms]);
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(''), 4200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);
  function addComplaint(complaint) { setComplaints((existing) => [complaint, ...existing]); }
  function updateReportStatus(id, status) { setComplaints((existing) => existing.map((report) => report.id === id ? { ...report, status } : report)); }
  function saveNotice(notice) { setNotices((existing) => existing.some((item) => item.id === notice.id) ? existing.map((item) => item.id === notice.id ? notice : item) : [notice, ...existing]); }
  function deleteNotice(id) { setNotices((existing) => existing.filter((notice) => notice.id !== id)); }
  function toggleRoom(number) { setRooms((existing) => existing.map((room) => room.number === number ? { ...room, status: room.status === 'Available' ? 'Occupied' : 'Available' } : room)); }
  function login() {
    try { sessionStorage.setItem(SESSION_KEY, 'signed-in'); } catch { /* Access remains limited to the current app session. */ }
    setManagerAuthenticated(true);
  }
  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Sign out remains available in memory. */ }
    setManagerAuthenticated(false);
    setLocation('/');
  }
  return <AppShell managerMode={managerAuthenticated && location === '/manager'} onSignOut={logout}>
    <Switch>
      <Route path="/"><HomePage notices={notices} /></Route>
      <Route path="/rooms"><RoomsPage rooms={rooms} /></Route>
      <Route path="/report"><ReportPage onAdd={addComplaint} onToast={setToastMessage} /></Route>
      <Route path="/terms"><TermsPage /></Route>
      <Route path="/manager">{managerAuthenticated
        ? <ManagerPage complaints={complaints} onStatus={updateReportStatus} notices={notices} onSaveNotice={saveNotice} onDeleteNotice={deleteNotice} rooms={rooms} onToggleRoom={toggleRoom} />
        : <ManagerLogin onLogin={login} />}</Route>
      <Route component={NotFoundPage} />
    </Switch>
    {toastMessage && <div role="status" aria-live="polite" data-testid="toast-success" className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 items-center gap-3 border border-[#82947d] bg-[#e7eadc] px-4 py-4 text-sm font-semibold text-[#34533e]">{toastMessage}<button type="button" aria-label="Dismiss notification" data-testid="button-dismiss-toast" onClick={() => setToastMessage('')} className="ml-auto border border-[#82947d] px-2 py-1 text-[10px] uppercase tracking-wider text-[#405b45]">Dismiss</button></div>}
  </AppShell>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>;
}

export default App;
