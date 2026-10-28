import { useEffect, useState, type ReactNode } from 'react';
import bedroomPhoto from '@assets/generated_images/jj-hostel-placeholder-bedroom.jpg';
import commonRoomPhoto from '@assets/generated_images/jj-hostel-placeholder-common-room.jpg';
import exteriorPhoto from '@assets/generated_images/jj-hostel-placeholder-exterior.jpg';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
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

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/report', label: 'Report an issue' },
  { href: '/manager', label: 'Manager view' },
];

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => setMobileMenu(false), [location]);
  return <div className="min-h-[100dvh] bg-[#eee9dd] text-[#1d3529]">
    <header className="sticky top-0 z-40 border-b border-[#c9c1b1] bg-[#eee9dd]">
      <div className="mx-auto flex min-h-[76px] max-w-[1240px] items-center justify-between px-5 md:px-9">
        <Link href="/" className="flex items-center gap-3" data-testid="link-home-brand">
          <span className="flex h-10 w-10 items-center justify-center border border-[#234633] text-[15px] font-bold tracking-[-.08em] text-[#234633]">J&amp;J</span>
          <span className="leading-tight">
            <span className="serif block text-[19px] font-bold tracking-[-.035em] text-[#20392b]">J &amp; J Hostel</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.19em] text-[#775344]">A good place to grow</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map(({ href, label }) => <Link key={href} href={href}
            data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
            className={`border-b-2 px-4 py-3 text-[13px] font-semibold ${location === href ? 'border-[#9a563d] text-[#234633]' : 'border-transparent text-[#625e54]'}`}>
            {label}
          </Link>)}
        </nav>
        <button type="button" onClick={() => setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu}
          aria-label={mobileMenu ? 'Close navigation menu' : 'Open navigation menu'} data-testid="button-mobile-menu"
          className="flex h-10 items-center border border-[#8e9a8b] px-3 text-[11px] font-bold uppercase tracking-wider text-[#234633] md:hidden">
          {mobileMenu ? 'Close' : 'Menu'}
        </button>
      </div>
      {mobileMenu && <nav className="border-t border-[#c9c1b1] bg-[#e8e2d5] px-5 py-3 md:hidden" aria-label="Mobile navigation">
        {navItems.map(({ href, label }) => <Link key={href} href={href} data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}
          className={`block border-b border-[#d5cebf] px-2 py-3 text-sm font-semibold ${location === href ? 'text-[#234633]' : 'text-[#625e54]'}`}>{label}</Link>)}
      </nav>}
    </header>
    <main>{children}</main>
    <footer className="mt-20 border-t border-[#c9c1b1] bg-[#e6e0d3]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-8 text-xs text-[#5d6257] sm:flex-row sm:items-center sm:justify-between md:px-9">
        <span className="font-semibold tracking-wide text-[#344638]">J &amp; J Hostel <span className="font-normal text-[#775d4c]">· Accra, Ghana</span></span>
        <span>Good neighbours. A comfortable place to study.</span>
      </div>
    </footer>
  </div>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-8 max-w-[650px]">
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#925039]">{eyebrow}</p>
    <h1 className="serif text-[38px] font-semibold leading-[1.08] tracking-[-.04em] text-[#20392b] sm:text-[48px]">{title}</h1>
    <p className="mt-4 max-w-[560px] text-[15px] leading-7 text-[#5e6258]">{description}</p>
  </div>;
}

function HomePage() {
  const notices = [
    { tag: 'WATER', date: 'MANAGER NOTICE', title: 'Water maintenance on Friday', body: 'Water service may be interrupted from 8:00 am while the storage tanks are serviced. Please store enough water beforehand; normal supply is expected by midday.' },
    { tag: 'CHECKOUT', date: 'END OF SEMESTER', title: 'End-of-semester checkout rules', body: 'Please return your room key to the manager, clear personal belongings, and leave the room tidy before checkout. Confirm your departure time in advance.' },
    { tag: 'COMMUNITY', date: 'HOUSE REMINDER', title: 'Quiet hours begin at 10:00 pm', body: 'Please keep noise low in shared spaces during study hours and overnight so everyone can rest and focus.' },
  ];
  const gallery = [
    { src: bedroomPhoto, alt: 'Temporary sample photo of a hostel bedroom with two beds, a desk and green-trimmed windows.', title: 'A room to settle into', label: 'Bedroom' },
    { src: commonRoomPhoto, alt: 'Temporary sample photo of the shared study room with large tables, bookshelves and open windows.', title: 'Room to study together', label: 'Shared study room' },
    { src: exteriorPhoto, alt: 'Temporary sample photo of the hostel exterior, showing balconies and a leafy entrance.', title: 'A warm welcome home', label: 'Exterior' },
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
          <img src={exteriorPhoto} alt="Temporary sample photo of a three-storey hostel exterior framed by tropical greenery." className="absolute inset-0 h-full w-full object-cover" />
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
          <figcaption className="border-b border-[#c9c1b1] py-3">
            <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#925039]">{item.label}</p>
            <p className="serif mt-1 text-[20px] font-semibold text-[#20392b]">{item.title}</p>
          </figcaption>
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
        {notices.map((notice, index) => <article key={notice.title} className="py-6 sm:py-7" data-testid={`notice-card-${index + 1}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="border border-[#b4ad9e] px-2.5 py-1 text-[9px] font-bold tracking-[.12em] text-[#465747]">{notice.tag}</span>
            <time className="text-xs text-[#716e63]">{notice.date}</time>
          </div>
          <h3 className="serif text-[21px] font-semibold tracking-[-.025em] text-[#263a2d] sm:text-[23px]">{notice.title}</h3>
          <p className="mt-2 max-w-[580px] text-[14px] leading-6 text-[#5e6258]">{notice.body}</p>
        </article>)}
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

function RoomsPage() {
  return <div className="mx-auto max-w-[1240px] px-5 pt-12 md:px-9 md:pt-[68px]">
    <SectionHeading eyebrow="YOUR NEXT ROOM" title="Room availability" description="A quick look at rooms at J & J. For current pricing, viewing times, or to reserve a space, speak with the manager." />
    <div className="mb-5 flex flex-wrap items-center gap-4 border-y border-[#c9c1b1] bg-[#e6e0d3] px-5 py-4">
      <span className="text-xs font-semibold text-[#454b41]">Room status</span>
      <span className="flex items-center gap-2 text-xs text-[#4c584b]"><i className="h-2 w-2 bg-[#47704e]" />Available</span>
      <span className="flex items-center gap-2 text-xs text-[#68655a]"><i className="h-2 w-2 bg-[#938a78]" />Occupied</span>
      <span className="ml-auto text-xs text-[#6c695f]">Availability can change. Please confirm with us.</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rooms.map((room) => <article key={room.number} data-testid={`card-room-${room.number}`} className="flex min-h-[205px] flex-col border border-[#c9c1b1] bg-[#e8e2d5] p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8c553f]">ROOM</span>
          <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold ${room.status === 'Available' ? 'border-[#9eac98] text-[#315c3d]' : 'border-[#c4bdaf] text-[#625f55]'}`}><i className={`h-1.5 w-1.5 ${room.status === 'Available' ? 'bg-[#56815e]' : 'bg-[#999181]'}`} />{room.status}</span>
        </div>
        <h2 className="serif mt-5 text-[25px] font-semibold tracking-[-.04em] text-[#263a2d]" data-testid={`text-room-number-${room.number}`}>Room {room.number}</h2>
        <p className="mt-1 text-xs text-[#666459]">{room.detail}</p>
        <div className="mt-auto pt-5">
          {room.status === 'Available' ? <a href="mailto:manager@jjhostel.com?subject=Room%20availability%20enquiry" data-testid={`link-contact-room-${room.number}`} className="flex w-full items-center justify-center border border-[#234633] bg-[#234633] px-3 py-2.5 text-[11px] font-bold text-[#f0eadc]">Contact Manager for Info</a> : <span className="block border-t border-[#c9c1b1] pt-3 text-[11px] font-medium text-[#716d62]">Currently occupied</span>}
        </div>
      </article>)}
    </div>
    <p className="mt-7 max-w-[760px] border-l-2 border-[#8d5943] pl-3 text-xs leading-5 text-[#666459]">Room listings are for guidance only. Please contact the manager to confirm a vacancy before making plans.</p>
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
  return <div className="mx-auto max-w-[1240px] px-5 pt-12 md:px-9 md:pt-[68px]">
    <div className="grid items-start gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
      <div>
        <SectionHeading eyebrow="WE’RE LISTENING" title="Let us know what needs fixing." description="A leaking tap, a faulty light, or something else around the hostel? Send a report and the manager will follow up." />
        <div className="mt-10 hidden border-y border-[#c9c1b1] bg-[#e6e0d3] p-5 sm:block">
          <p className="text-sm font-bold text-[#344638]">Your report goes straight to the manager</p>
          <p className="mt-1 text-xs leading-5 text-[#666459]">Include enough detail to help us understand the issue and where to find it.</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitReport)} className="border border-[#c9c1b1] bg-[#e8e2d5] p-6 sm:p-9" data-testid="form-complaint">
          <div className="mb-7 border-b border-[#c9c1b1] pb-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#925039]">MAINTENANCE REPORT</p><h2 className="serif mt-2 text-[25px] font-semibold tracking-[-.035em] text-[#263a2d]">What’s the issue?</h2></div>
          <div className="space-y-5">
            <FormField control={form.control} name="room" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12px] font-bold text-[#454b41]">Room Number <span className="text-[#925039]">*</span></FormLabel>
                <FormControl><Input {...field} type="text" placeholder="e.g. Room 101" data-testid="input-room-number" className="h-auto rounded-none border-[#bdb5a5] bg-[#f0eadc] px-4 py-3 text-sm text-[#263a2d] placeholder:text-[#797568] focus-visible:ring-[#53745b]/20" /></FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12px] font-bold text-[#454b41]">Issue Category <span className="text-[#925039]">*</span></FormLabel>
                <FormControl>
                  <select {...field} data-testid="select-issue-category" className="w-full rounded-none border border-[#bdb5a5] bg-[#f0eadc] px-4 py-3 text-sm text-[#263a2d] outline-none focus:border-[#53745b] focus:ring-2 focus:ring-[#53745b]/15">
                    <option value="">Select a category</option>
                    {issueCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12px] font-bold text-[#454b41]">Complaint Description <span className="text-[#925039]">*</span></FormLabel>
                <FormControl><Textarea {...field} rows={5} placeholder="Please describe what’s happening and where..." data-testid="input-complaint-description" className="min-h-0 resize-y rounded-none border-[#bdb5a5] bg-[#f0eadc] px-4 py-3 text-sm leading-6 text-[#263a2d] placeholder:text-[#797568] focus-visible:ring-[#53745b]/20" /></FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
          </div>
          <button type="submit" data-testid="button-submit-complaint" className="mt-7 flex w-full items-center justify-center border border-[#234633] bg-[#234633] px-5 py-3.5 text-sm font-bold text-[#f0eadc] focus:outline-none focus:ring-2 focus:ring-[#53745b] focus:ring-offset-2">Send report</button>
          <p className="mt-4 text-center text-[11px] text-[#6c695f]">Please don’t include sensitive personal information.</p>
        </form>
      </Form>
    </div>
  </div>;
}

function ManagerPage({ complaints }: { complaints: Complaint[] }) {
  return <div className="mx-auto max-w-[1240px] px-5 pt-12 md:px-9 md:pt-[68px]">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <SectionHeading eyebrow="HOSTEL OPERATIONS" title="Maintenance reports" description="A clear view of what residents have flagged, all in one place." />
      <div className="mb-8 inline-flex w-fit items-center border border-[#bdb5a5] bg-[#e6e0d3] px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#53594e]">Demo manager view</div>
    </div>
    <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-[470px]">
      <div className="border border-[#c9c1b1] bg-[#e8e2d5] p-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#68655a]">TOTAL REPORTS</p><p className="serif mt-2 text-[34px] font-semibold tracking-[-.05em] text-[#2c4637]" data-testid="text-total-complaints">{complaints.length}</p></div>
      <div className="border border-[#c9c1b1] bg-[#e8e2d5] p-5"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#68655a]">LATEST REPORT</p><p className="serif mt-2 text-[21px] font-semibold tracking-[-.03em] text-[#2c4637]">{complaints.some(item => item.date === 'Just now') ? 'Just now' : 'Today'}</p></div>
    </div>
    <div className="overflow-hidden border border-[#c9c1b1] bg-[#e8e2d5]">
      <div className="flex items-center justify-between border-b border-[#c9c1b1] px-5 py-5 sm:px-7">
        <div><h2 className="serif text-[20px] font-semibold tracking-[-.03em] text-[#263a2d]">Resident reports</h2><p className="mt-1 text-xs text-[#68655a]">Reports are saved in this browser for the demo.</p></div>
        <span className="border border-[#bdb5a5] px-3 py-1.5 text-[10px] font-bold text-[#53594e]" data-testid="status-report-count">{complaints.length} reports</span>
      </div>
      {complaints.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[660px] border-collapse text-left">
          <thead><tr className="bg-[#ded8ca] text-[10px] font-bold uppercase tracking-[.13em] text-[#625f55]"><th className="px-7 py-3.5">Room</th><th className="px-5 py-3.5">Category</th><th className="px-5 py-3.5">Description</th></tr></thead>
          <tbody>{complaints.map((complaint) => <tr key={complaint.id} data-testid={`row-complaint-${complaint.id}`} className="border-t border-[#d1c9b9] align-top">
            <td className="whitespace-nowrap px-7 py-5 text-sm font-bold text-[#3a453a]" data-testid={`text-complaint-room-${complaint.id}`}>{complaint.room}</td>
            <td className="px-5 py-5"><span className="inline-flex border border-[#c4bdaf] px-2.5 py-1 text-[10px] font-semibold text-[#50594c]" data-testid={`text-complaint-category-${complaint.id}`}>{complaint.category}</span></td>
            <td className="max-w-[430px] px-5 py-5 text-[13px] leading-5 text-[#56584f]" data-testid={`text-complaint-description-${complaint.id}`}>{complaint.description}</td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="px-6 py-16 text-center"><p className="text-sm font-bold text-[#4c5147]">All quiet for now</p><p className="mt-1 text-xs text-[#666459]">New resident reports will appear here.</p></div>}
    </div>
    <p className="mt-4 text-[11px] leading-5 text-[#666459]">This is a demonstration dashboard. No sign-in or backend is connected.</p>
  </div>;
}

function NotFoundPage() {
  return <div className="mx-auto max-w-[1240px] px-5 py-24 text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#925039]">NOT FOUND</p><h1 className="serif mt-3 text-4xl font-semibold text-[#20392b]">We can’t find that page.</h1><Link href="/" data-testid="link-not-found-home" className="mt-6 inline-flex border border-[#234633] bg-[#234633] px-5 py-3 text-sm font-bold text-[#f0eadc]">Back home</Link></div>;
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
    {toastMessage && <div role="status" aria-live="polite" data-testid="toast-success" className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 items-center gap-3 border border-[#82947d] bg-[#e7eadc] px-4 py-4 text-sm font-semibold text-[#34533e]">{toastMessage}<button type="button" aria-label="Dismiss notification" data-testid="button-dismiss-toast" onClick={() => setToastMessage('')} className="ml-auto border border-[#82947d] px-2 py-1 text-[10px] uppercase tracking-wider text-[#405b45]">Dismiss</button></div>}
  </AppShell>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>;
}

export default App;
