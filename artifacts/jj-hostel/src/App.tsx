import { useEffect, useState, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowDownRight, ArrowRight, Bell, Check, CheckCircle2, ChevronRight,
  ClipboardList, DoorOpen, House, Mail, Menu, MessageSquareText, ShieldCheck,
  X,
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Complaint = {
  id: string;
  room: string;
  category: string;
  description: string;
  date: string;
};

const STORAGE_KEY = 'jj-hostel-demo-complaints';
const seededComplaints: Complaint[] = [
  { id: 'seed-1', room: 'Room 204', category: 'Plumbing', description: 'The shower tap is dripping continuously, even when turned off.', date: 'Today, 9:15 am' },
  { id: 'seed-2', room: 'Room 108', category: 'Electrical', description: 'The light by the study desk has stopped working.', date: 'Yesterday, 4:40 pm' },
  { id: 'seed-3', room: 'Room 312', category: 'Carpentry', description: 'Wardrobe hinge has come loose and the door will not close properly.', date: 'Mon, 11:20 am' },
];

const rooms = [
  { number: '101', status: 'Available', detail: 'Ground floor · shared washroom' },
  { number: '102', status: 'Occupied', detail: 'Ground floor · shared washroom' },
  { number: '103', status: 'Occupied', detail: 'Ground floor · shared washroom' },
  { number: '201', status: 'Available', detail: 'First floor · shared washroom' },
  { number: '202', status: 'Occupied', detail: 'First floor · shared washroom' },
  { number: '204', status: 'Occupied', detail: 'First floor · shared washroom' },
  { number: '301', status: 'Occupied', detail: 'Second floor · shared washroom' },
  { number: '302', status: 'Available', detail: 'Second floor · shared washroom' },
];

const issueCategories = ['Plumbing', 'Electrical', 'Carpentry', 'General'] as const;
const complaintSchema = z.object({
  room: z.string().trim().min(1, 'Enter your room number.'),
  category: z.string().min(1, 'Select an issue category.').refine(
    (value) => issueCategories.includes(value as (typeof issueCategories)[number]),
    'Choose a listed category.',
  ),
  description: z.string().trim().min(1, 'Describe the issue.'),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

function readComplaints(): Complaint[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return [...parsed, ...seededComplaints];
    }
  } catch {
    // Fall back to the seeded demo reports when browser storage is unavailable.
  }
  return seededComplaints;
}

function saveComplaint(complaint: Complaint) {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([complaint, ...current]));
  } catch {
    // Submission still succeeds for this session if storage is blocked.
  }
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const navItems = [
    { href: '/', label: 'Home', icon: House },
    { href: '/rooms', label: 'Rooms', icon: DoorOpen },
    { href: '/report', label: 'Report an issue', icon: MessageSquareText },
    { href: '/manager', label: 'Manager view', icon: ClipboardList },
  ];
  useEffect(() => setMobileMenu(false), [location]);
  return (
    <div className="min-h-[100dvh] bg-[#f6f2e9]">
      <header className="sticky top-0 z-40 border-b border-[#e5ddcf] bg-[#f8f5ed]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 md:px-9">
          <Link href="/" className="group flex items-center gap-3" data-testid="link-home-brand">
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#244e3c] text-[#f6f2e9]">
              <House size={19} strokeWidth={1.8} />
            </span>
            <span className="leading-tight">
              <span className="serif block text-[18px] font-extrabold tracking-[-.04em] text-[#28352d]">J &amp; J Hostel</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.19em] text-[#82796d]">A good place to grow</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
                className={`rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors ${location === href ? 'bg-[#e9e5d9] text-[#244e3c]' : 'text-[#625e54] hover:bg-[#efeadf] hover:text-[#244e3c]'}`}>
                {label}
              </Link>
            ))}
          </nav>
          <button type="button" onClick={() => setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu}
            aria-label={mobileMenu ? 'Close navigation menu' : 'Open navigation menu'} data-testid="button-mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e2d9ca] text-[#344b3e] md:hidden">
            {mobileMenu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {mobileMenu && <nav className="border-t border-[#e5ddcf] bg-[#f8f5ed] px-5 py-3 md:hidden" aria-label="Mobile navigation">
          {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${location === href ? 'bg-[#e9e5d9] text-[#244e3c]' : 'text-[#625e54]'}`}><Icon size={17} />{label}</Link>)}
        </nav>}
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-[#e5ddcf] bg-[#f1ede3]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-8 text-xs text-[#726d62] sm:flex-row sm:items-center sm:justify-between md:px-9">
          <span className="font-semibold tracking-wide text-[#465349]">J &amp; J Hostel <span className="font-normal text-[#8a8375]">· Accra, Ghana</span></span>
          <span>Good neighbours. A comfortable place to study.</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-8 max-w-[650px]">
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[.18em] text-[#9a583f]">{eyebrow}</p>
    <h1 className="serif text-[36px] font-extrabold leading-[1.1] tracking-[-.045em] text-[#29372e] sm:text-[46px]">{title}</h1>
    <p className="mt-4 max-w-[560px] text-[15px] leading-7 text-[#706b60]">{description}</p>
  </div>;
}

function HomePage() {
  const notices = [
    { tag: 'WATER', date: 'MANAGER NOTICE', title: 'Water maintenance on Friday', body: 'Water service may be interrupted from 8:00 am while the storage tanks are serviced. Please store enough water beforehand; normal supply is expected by midday.' },
    { tag: 'CHECKOUT', date: 'END OF SEMESTER', title: 'End-of-semester checkout rules', body: 'Please return your room key to the manager, clear personal belongings, and leave the room tidy before checkout. Confirm your departure time in advance.' },
    { tag: 'COMMUNITY', date: 'HOUSE REMINDER', title: 'Quiet hours begin at 10:00 pm', body: 'Please keep noise low in shared spaces during study hours and overnight so everyone can rest and focus.' },
  ];
  return <div className="page-enter">
    <section className="mx-auto max-w-[1240px] px-5 pt-8 md:px-9 md:pt-12">
      <div className="grain relative overflow-hidden rounded-[28px] bg-[#264d3c] px-7 py-10 text-[#f5f0e5] sm:px-12 sm:py-14 lg:px-[76px] lg:py-[76px]">
        <div className="relative z-10 max-w-[670px]">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#f5f0e5]/20 bg-[#f5f0e5]/10 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-[#e6dfd0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d3a17c]" /> A STUDENT HOME IN ACCRA
          </div>
          <h1 className="serif max-w-[620px] text-[48px] font-extrabold leading-[.98] tracking-[-.055em] sm:text-[66px] lg:text-[78px]">A place to settle in<br className="hidden sm:block" /> and <span className="text-[#ddb08a]">find your rhythm.</span></h1>
          <p className="mt-6 max-w-[500px] text-[15px] leading-7 text-[#e2e8df]/85 sm:text-[16px]">Your home base for the semester. Check room availability, catch up on what’s happening, or let us know when something needs attention.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/rooms" data-testid="link-hero-check-rooms" className="inline-flex items-center gap-2 rounded-full bg-[#f4efe3] px-5 py-3.5 text-[13px] font-bold text-[#274b39] transition-transform hover:-translate-y-0.5">Check room availability <ArrowRight size={15} /></Link>
            <Link href="/report" data-testid="link-hero-report-issue" className="inline-flex items-center gap-2 rounded-full border border-[#f2eddf]/35 px-5 py-3.5 text-[13px] font-semibold text-[#f2eddf] hover:bg-white/10">Report an issue <ArrowDownRight size={15} /></Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-20 hidden h-[500px] w-[465px] lg:block">
          <div className="absolute right-[78px] top-[91px] h-[305px] w-[275px] rounded-[150px_150px_12px_12px] border border-[#e7dbc5]/25 bg-[#d5ad83]/[.09]" />
          <div className="absolute right-[120px] top-[133px] h-[263px] w-[191px] rounded-[110px_110px_4px_4px] border border-[#e7dbc5]/30" />
          <div className="absolute right-[188px] top-[270px] h-[126px] w-[54px] rounded-t-full border border-[#e7dbc5]/40 bg-[#d5ad83]/15" />
          <div className="absolute right-[75px] top-[365px] h-[1px] w-[360px] bg-[#e7dbc5]/35" />
          <div className="absolute right-[55px] top-[395px] text-[10px] uppercase tracking-[.25em] text-[#e7dbc5]/55">A place of your own</div>
        </div>
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full border border-white/[.09] lg:hidden" />
      </div>
    </section>

    <section className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 md:grid-cols-[.78fr_1.22fr] md:px-9 md:py-[88px]">
      <div className="md:sticky md:top-32 md:self-start">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#e9e3d5] text-[#985a40]"><Bell size={19} /></div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#9a583f]">THE NOTICE BOARD</p>
        <h2 className="serif text-[36px] font-extrabold leading-tight tracking-[-.045em] text-[#29372e]">A few things<br />to know.</h2>
        <p className="mt-4 max-w-[300px] text-sm leading-6 text-[#706b60]">Updates from the manager to help the house run smoothly.</p>
        <div className="mt-7 hidden items-center gap-2 text-xs font-semibold text-[#82796d] md:flex"><span className="h-px w-8 bg-[#b7aa96]" /> Updated regularly</div>
      </div>
      <div className="divide-y divide-[#e4dccd] border-y border-[#e4dccd]">
        {notices.map((notice, index) => <article key={notice.title} className="group py-6 sm:py-7" data-testid={`notice-card-${index + 1}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-[#e8e4d9] px-2.5 py-1 text-[9px] font-bold tracking-[.12em] text-[#59664f]">{notice.tag}</span>
            <time className="text-xs text-[#898274]">{notice.date}</time>
          </div>
          <h3 className="serif text-[20px] font-bold tracking-[-.025em] text-[#303c33] sm:text-[22px]">{notice.title}</h3>
          <p className="mt-2 max-w-[580px] text-[14px] leading-6 text-[#706b60]">{notice.body}</p>
        </article>)}
      </div>
    </section>
    <section className="mx-auto max-w-[1240px] px-5 pb-4 md:px-9">
      <div className="flex flex-col gap-6 rounded-[24px] border border-[#e2daca] bg-[#f0ece2] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
        <div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#9a583f]">HERE TO HELP</p><h2 className="serif mt-2 text-[25px] font-extrabold tracking-[-.035em] text-[#29372e]">Something not quite right?</h2><p className="mt-1.5 text-sm text-[#716b60]">Tell us what’s up and we’ll take it from there.</p></div>
        <Link href="/report" data-testid="link-home-report" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#284d3b] px-5 py-3 text-[13px] font-bold text-[#f5f0e5] hover:bg-[#1d3e2e]">Send a report <ArrowRight size={15} /></Link>
      </div>
    </section>
  </div>;
}

function RoomsPage() {
  return <div className="page-enter mx-auto max-w-[1240px] px-5 pt-12 md:px-9 md:pt-[68px]">
    <SectionHeading eyebrow="YOUR NEXT ROOM" title="Room availability" description="A quick look at rooms at J & J. For current pricing, viewing times, or to reserve a space, speak with the manager." />
    <div className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-[#e5ddcf] bg-[#f9f6ef] px-5 py-4">
      <span className="text-xs font-semibold text-[#5e5b51]">Room status</span>
      <span className="flex items-center gap-2 text-xs text-[#68655a]"><i className="h-2 w-2 rounded-full bg-[#47785d]" /> Available</span>
      <span className="flex items-center gap-2 text-xs text-[#68655a]"><i className="h-2 w-2 rounded-full bg-[#a69e8e]" /> Occupied</span>
      <span className="ml-auto text-xs text-[#898274]">Availability can change — please confirm with us.</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rooms.map((room) => <article key={room.number} data-testid={`card-room-${room.number}`} className="flex min-h-[215px] flex-col rounded-[20px] border border-[#e4dccd] bg-[#fbf8f1] p-5 transition-all hover:-translate-y-0.5 hover:border-[#c8bdab] hover:shadow-[0_12px_28px_-22px_rgba(46,53,42,.35)]">
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeadf] text-[#66705c]"><DoorOpen size={19} /></span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${room.status === 'Available' ? 'bg-[#e1ebdf] text-[#3d6b4b]' : 'bg-[#ece9e2] text-[#777265]'}`}><i className={`h-1.5 w-1.5 rounded-full ${room.status === 'Available' ? 'bg-[#56815e]' : 'bg-[#999181]'}`} />{room.status}</span>
        </div>
        <h2 className="serif mt-5 text-[24px] font-extrabold tracking-[-.04em] text-[#303a31]" data-testid={`text-room-number-${room.number}`}>Room {room.number}</h2>
        <p className="mt-1 text-xs text-[#817b6f]">{room.detail}</p>
        <div className="mt-auto pt-5">
          {room.status === 'Available' ? <a href="mailto:manager@jjhostel.com?subject=Room%20availability%20enquiry" data-testid={`link-contact-room-${room.number}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#284d3b] px-3 py-2.5 text-[11px] font-bold text-[#f8f4e9] transition-colors hover:bg-[#1d3e2e]">Contact Manager for Info <Mail size={13} /></a> : <span className="block border-t border-[#e9e2d6] pt-3 text-[11px] font-medium text-[#90897b]">Currently occupied</span>}
        </div>
      </article>)}
    </div>
    <p className="mt-7 flex items-start gap-2 text-xs leading-5 text-[#817b6f]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#68775e]" />Room listings are for guidance only. Please contact the manager to confirm a vacancy before making plans.</p>
  </div>;
}

function ReportPage({ onAdd, onToast }: { onAdd: (complaint: Complaint) => void; onToast: (message: string) => void }) {
  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { room: '', category: '', description: '' },
  });

  function submitReport(values: ComplaintFormValues) {
    const complaint: Complaint = {
      id: `report-${Date.now()}`,
      room: values.room.trim(),
      category: values.category,
      description: values.description.trim(),
      date: 'Just now',
    };
    onAdd(complaint);
    onToast('Your report has been sent to the hostel manager.');
    form.reset();
  }
  return <div className="page-enter mx-auto max-w-[1240px] px-5 pt-12 md:px-9 md:pt-[68px]">
    <div className="grid items-start gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
      <div>
        <SectionHeading eyebrow="WE’RE LISTENING" title="Let us know what needs fixing." description="A leaking tap, a faulty light, or something else around the hostel? Send a report and the manager will follow up." />
        <div className="mt-10 hidden rounded-[20px] border border-[#e3dbcc] bg-[#f0ece2] p-5 sm:flex sm:items-start sm:gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e3ddcf] text-[#53674f]"><CheckCircle2 size={19} /></span>
          <div><p className="text-sm font-bold text-[#39473b]">Your report goes straight to the manager</p><p className="mt-1 text-xs leading-5 text-[#777166]">Include enough detail to help us understand the issue and where to find it.</p></div>
        </div>
      </div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(submitReport)} className="rounded-[24px] border border-[#e4dccd] bg-[#fbf8f1] p-6 shadow-[0_18px_54px_-42px_rgba(53,51,40,.28)] sm:p-9" data-testid="form-complaint">
        <div className="mb-7 border-b border-[#e9e2d6] pb-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9a583f]">MAINTENANCE REPORT</p><h2 className="serif mt-2 text-[24px] font-extrabold tracking-[-.035em] text-[#303a31]">What’s the issue?</h2></div>
        <div className="space-y-5">
          <FormField control={form.control} name="room" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px] font-bold text-[#4a4a40]">Room Number <span className="text-[#a6573d]">*</span></FormLabel>
              <FormControl><Input {...field} type="text" placeholder="e.g. Room 101" data-testid="input-room-number" className="h-auto rounded-xl border-[#dcd3c3] bg-[#fdfbf6] px-4 py-3 text-sm text-[#303a31] shadow-none placeholder:text-[#a49c8e] focus-visible:ring-[#53745b]/20" /></FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px] font-bold text-[#4a4a40]">Issue Category <span className="text-[#a6573d]">*</span></FormLabel>
              <FormControl>
                <select {...field} data-testid="select-issue-category" className="w-full rounded-xl border border-[#dcd3c3] bg-[#fdfbf6] px-4 py-3 text-sm text-[#303a31] outline-none transition focus:border-[#53745b] focus:ring-2 focus:ring-[#53745b]/15">
                  <option value="">Select a category</option>
                  {issueCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px] font-bold text-[#4a4a40]">Complaint Description <span className="text-[#a6573d]">*</span></FormLabel>
              <FormControl><Textarea {...field} rows={5} placeholder="Please describe what’s happening and where..." data-testid="input-complaint-description" className="min-h-0 resize-y rounded-xl border-[#dcd3c3] bg-[#fdfbf6] px-4 py-3 text-sm leading-6 text-[#303a31] shadow-none placeholder:text-[#a49c8e] focus-visible:ring-[#53745b]/20" /></FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )} />
        </div>
        <button type="submit" data-testid="button-submit-complaint" className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#284d3b] px-5 py-3.5 text-sm font-bold text-[#f8f4e9] transition hover:bg-[#1d3e2e] focus:outline-none focus:ring-2 focus:ring-[#53745b] focus:ring-offset-2">Send report <ArrowRight size={16} /></button>
        <p className="mt-4 text-center text-[11px] text-[#898274]">Please don’t include sensitive personal information.</p>
      </form>
      </Form>
    </div>
  </div>;
}

function ManagerPage({ complaints }: { complaints: Complaint[] }) {
  return <div className="page-enter mx-auto max-w-[1240px] px-5 pt-12 md:px-9 md:pt-[68px]">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <SectionHeading eyebrow="HOSTEL OPERATIONS" title="Maintenance reports" description="A clear view of what residents have flagged, all in one place." />
      <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#ded5c4] bg-[#f5f1e8] px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#6e6a5e]"><span className="h-1.5 w-1.5 rounded-full bg-[#7a946d]" /> Demo manager view</div>
    </div>
    <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-[470px]">
      <div className="rounded-[18px] border border-[#e4dccd] bg-[#fbf8f1] p-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#827b6e]">TOTAL REPORTS</p><p className="serif mt-2 text-[34px] font-extrabold tracking-[-.05em] text-[#2c4637]" data-testid="text-total-complaints">{complaints.length}</p></div>
      <div className="rounded-[18px] border border-[#e4dccd] bg-[#fbf8f1] p-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#827b6e]">LATEST REPORT</p><p className="serif mt-2 text-[21px] font-bold tracking-[-.03em] text-[#2c4637]">{complaints.some(item => item.date === 'Just now') ? 'Just now' : 'Today'}</p></div>
    </div>
    <div className="overflow-hidden rounded-[22px] border border-[#e4dccd] bg-[#fbf8f1]">
      <div className="flex items-center justify-between border-b border-[#e8e0d3] px-5 py-5 sm:px-7">
        <div><h2 className="serif text-[19px] font-extrabold tracking-[-.03em] text-[#303a31]">Resident reports</h2><p className="mt-1 text-xs text-[#827b6e]">Reports are saved in this browser for the demo.</p></div>
        <span className="rounded-full bg-[#e9e5da] px-3 py-1.5 text-[10px] font-bold text-[#68675b]" data-testid="status-report-count">{complaints.length} reports</span>
      </div>
      {complaints.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[660px] border-collapse text-left">
           <thead><tr className="bg-[#f3efe6] text-[10px] font-bold uppercase tracking-[.13em] text-[#817b70]"><th className="px-7 py-3.5">Room</th><th className="px-5 py-3.5">Category</th><th className="px-5 py-3.5">Description</th></tr></thead>
          <tbody>{complaints.map((complaint) => <tr key={complaint.id} data-testid={`row-complaint-${complaint.id}`} className="border-t border-[#eee8dc] align-top transition-colors hover:bg-[#f7f3eb]">
            <td className="whitespace-nowrap px-7 py-5 text-sm font-bold text-[#3a453a]" data-testid={`text-complaint-room-${complaint.id}`}>{complaint.room}</td>
            <td className="px-5 py-5"><span className="inline-flex rounded-full bg-[#e9e7dc] px-2.5 py-1 text-[10px] font-semibold text-[#5f6857]" data-testid={`text-complaint-category-${complaint.id}`}>{complaint.category}</span></td>
            <td className="max-w-[430px] px-5 py-5 text-[13px] leading-5 text-[#656258]" data-testid={`text-complaint-description-${complaint.id}`}>{complaint.description}</td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="px-6 py-16 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efeadf] text-[#71806a]"><Check size={21} /></span><p className="mt-4 text-sm font-bold text-[#4c5147]">All quiet for now</p><p className="mt-1 text-xs text-[#837d71]">New resident reports will appear here.</p></div>}
    </div>
    <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#878072]"><ShieldCheck size={14} className="mt-0.5 shrink-0" />This is a demonstration dashboard. No sign-in or backend is connected.</p>
  </div>;
}

function NotFoundPage() {
  return <div className="mx-auto max-w-[1240px] px-5 py-24 text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9a583f]">NOT FOUND</p><h1 className="serif mt-3 text-4xl font-extrabold text-[#29372e]">We can’t find that page.</h1><Link href="/" data-testid="link-not-found-home" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#284d3b] px-5 py-3 text-sm font-bold text-[#f8f4e9]">Back home <ChevronRight size={15} /></Link></div>;
}

function Router() {
  const [complaints, setComplaints] = useState<Complaint[]>(readComplaints);
  const [toastMessage, setToastMessage] = useState('');
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(''), 4200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);
  function addComplaint(complaint: Complaint) {
    saveComplaint(complaint);
    setComplaints((existing) => [complaint, ...existing]);
  }
  return <AppShell>
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/rooms" component={RoomsPage} />
      <Route path="/report"><ReportPage onAdd={addComplaint} onToast={setToastMessage} /></Route>
      <Route path="/manager"><ManagerPage complaints={complaints} /></Route>
      <Route component={NotFoundPage} />
    </Switch>
    {toastMessage && <div role="status" aria-live="polite" data-testid="toast-success" className="page-enter fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#c9d8c9] bg-[#f7f8ef] px-4 py-4 text-sm font-semibold text-[#34533e] shadow-[0_14px_50px_-20px_rgba(37,54,39,.35)]"><CheckCircle2 size={19} className="shrink-0 text-[#56805f]" />{toastMessage}<button type="button" aria-label="Dismiss notification" data-testid="button-dismiss-toast" onClick={() => setToastMessage('')} className="ml-auto rounded-full p-1 text-[#657761] hover:bg-[#e8efe4]"><X size={16} /></button></div>}
  </AppShell>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>;
}

export default App;
