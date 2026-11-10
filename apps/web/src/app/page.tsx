import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getRequestHost, fetchCurrentTenant, formatInstitutionType, getCanonicalUrl, getApiBaseUrl } from '@/lib/tenant';
import type { PublicProgrammeDto, PublicNewsArticleDto, PublicEventItemDto, PublicStaffProfileDto } from '@school/shared';
import { truncateWords, cleanTag } from '@/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const host = await getRequestHost();
  const tenant = await fetchCurrentTenant(host);
  const name = tenant?.name || 'School Platform';
  const type = formatInstitutionType(tenant?.institutionType) || 'Education';
  const description = `Discover ${name}: our story, academic programmes, educators, campus life, news and admissions information.`;
  return { title: `${name} | ${type}`, description, alternates: { canonical: getCanonicalUrl(tenant, '/', host) }, openGraph: { title: name, description, type: 'website' } };
}

async function fetchHomeContent(host: string) {
  const apiUrl = getApiBaseUrl();
  const headers = { Host: host, 'x-forwarded-host': host };
  try {
    const [p, n, e, s] = await Promise.all([
      fetch(`${apiUrl}/api/v1/tenant/public/academics/programmes?limit=3`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/v1/tenant/public/news?limit=3`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/v1/tenant/public/events?timeframe=upcoming&limit=3`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/v1/tenant/public/staff?limit=4`, { headers, cache: 'no-store' }),
    ]);
    const programmes: PublicProgrammeDto[] = p.ok ? (await p.json()).data?.items || [] : [];
    const news: PublicNewsArticleDto[] = n.ok ? (await n.json()).data?.items || [] : [];
    const events: PublicEventItemDto[] = e.ok ? (await e.json()).data?.items || [] : [];
    const staff: PublicStaffProfileDto[] = s.ok ? (await s.json()).data?.items || [] : [];
    return { programmes, news, events, staff };
  } catch (error) { console.error('[Home Content]', error); return { programmes: [], news: [], events: [], staff: [] }; }
}

const quickLinks = [
  { href: '/academics', icon: '✳', title: 'Academics', detail: 'Explore our programmes and learning pathways' },
  { href: '/admissions', icon: '↗', title: 'Admissions', detail: 'Everything you need to know to join us' },
  { href: '/staff', icon: '♧', title: 'Our people', detail: 'Meet our educators and leadership team' },
  { href: '/events', icon: '▦', title: 'Campus life', detail: 'Discover events and activities' },
];

export default async function HomePage() {
  const host = await getRequestHost();
  const tenant = await fetchCurrentTenant(host);
  const { programmes, news, events, staff } = await fetchHomeContent(host);
  const name = tenant?.name || 'Our School';
  const type = formatInstitutionType(tenant?.institutionType) || 'Learning • Growth • Opportunity';
  return (
    <div className="home-page">
      <section className="hero-modern">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-shade" />
        <div className="hero-content page-width">
          <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> {type}</span>
          <h1>Where curiosity<br/><em>becomes possibility.</em></h1>
          <p>Welcome to {name}. A community built around discovery, strong values, and the belief that every learner has the potential to shape a brighter future.</p>
          <div className="hero-actions">
            <Link href="#our-story" className="button-light">Discover our school <span>↗</span></Link>
            <Link href="/admissions" className="button-ghost">Admissions information <span>→</span></Link>
          </div>
          <div className="hero-note"><span className="hero-note-line"/> A place to learn. A place to belong.</div>
        </div>
        <div className="hero-index">01 <span/> 04</div>
      </section>

      <section className="intro-band page-width section-space">
        <div className="intro-label"><span className="eyebrow">WELCOME TO {name.toUpperCase()}</span><span className="intro-rule"/></div>
        <div className="intro-copy"><h2>Education that opens doors and <em>builds futures.</em></h2><p>We bring learners, educators, and families together in an environment where knowledge is valued, individual strengths are nurtured, and meaningful achievement is encouraged.</p><Link href="#our-story" className="text-link">More about our school <span>↗</span></Link></div>
      </section>

      <section className="quick-section page-width">
        <div className="quick-grid">{quickLinks.map((item, index) => <Link href={item.href} className="quick-card" key={item.href}><span className="quick-number">0{index + 1}</span><span className="quick-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.detail}</p><span className="quick-arrow">↗</span></Link>)}</div>
      </section>

      <section id="our-story" className="story-section section-space">
        <div className="page-width story-grid">
          <div className="story-visual"><div className="story-photo"/><div className="story-stamp"><span>LEARN</span><b>WITH</b><span>PURPOSE</span></div><div className="story-caption">A community where every learner matters.</div></div>
          <div className="story-copy"><span className="eyebrow">OUR STORY</span><h2>Rooted in values.<br/><em>Focused on tomorrow.</em></h2><p>Great education is more than what happens in a classroom. It is the confidence to ask questions, the courage to try, and the support to keep growing. At {name}, we work to make those experiences part of every learner's journey.</p><div className="values-list"><div><span>01</span><b>Curiosity</b><small>Encouraging a lifelong love of learning.</small></div><div><span>02</span><b>Character</b><small>Growing with integrity and respect.</small></div><div><span>03</span><b>Community</b><small>Achieving more by learning together.</small></div></div><Link href="/about" className="button-dark">Get to know us <span>↗</span></Link></div>
        </div>
      </section>

      <section className="program-section section-space page-width">
        <div className="section-heading"><div><span className="eyebrow">LEARNING PATHWAYS</span><h2>Explore our <em>academics.</em></h2><p>Learning opportunities designed to help every student discover their strengths.</p></div><Link href="/academics" className="text-link">View all programmes <span>↗</span></Link></div>
        {programmes.length ? <div className="programme-grid">{programmes.map((prog, i) => <article className="programme-card" key={prog.id}><div className={`programme-art art-${i + 1}`}><span>0{i + 1}</span><b>{prog.department?.name || 'ACADEMIC'}</b></div><div className="programme-body">{prog.level && <span className="mini-label">{prog.level.name}</span>}<h3>{prog.title}</h3><p>{truncateWords(prog.summary, 115) || 'Discover this learning pathway and the opportunities it offers.'}</p><Link href={`/academics/${prog.slug}`} className="text-link">Explore programme <span>↗</span></Link></div></article>)}</div> : <div className="empty-panel"><span className="eyebrow">ACADEMIC INFORMATION</span><p>Our academic programme information is being updated. Please contact the school for details.</p><Link href="/contact" className="text-link">Contact the school <span>↗</span></Link></div>}
      </section>

      <section className="campus-banner"><div className="campus-overlay"/><div className="page-width campus-content"><span className="eyebrow eyebrow-light">MORE THAN A CLASSROOM</span><h2>Discover the people<br/>and moments that make<br/><em>our community.</em></h2><Link href="/events" className="button-light">Explore campus life <span>↗</span></Link></div></section>

      <section className="news-section section-space page-width"><div className="section-heading"><div><span className="eyebrow">FROM OUR COMMUNITY</span><h2>Stories & <em>updates.</em></h2><p>The latest news, announcements, and moments from our institution.</p></div><Link href="/news" className="text-link">All news & announcements <span>↗</span></Link></div>
        {news.length ? <div className="news-grid">{news.map((item, i) => <article className={`news-card news-card-${i + 1}`} key={item.id}><div className="news-card-image"><span>{item.tags?.[0] ? cleanTag(item.tags[0]) : 'SCHOOL NEWS'}</span></div><div className="news-card-content"><time>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Latest update'}</time><h3>{item.title}</h3><p>{truncateWords(item.summary || item.body, 110) || 'Read the latest update from our school community.'}</p><Link href={`/news/${item.slug}`} className="text-link">Read story <span>↗</span></Link></div></article>)}</div> : <div className="empty-panel"><p>New stories and announcements will appear here. Check back soon.</p></div>}
      </section>

      {events.length > 0 && <section className="events-section section-space"><div className="page-width"><div className="section-heading"><div><span className="eyebrow">SAVE THE DATE</span><h2>What's <em>happening.</em></h2></div><Link href="/events" className="text-link">View event calendar <span>↗</span></Link></div><div className="event-list">{events.map((event) => <article className="event-row" key={event.id}><div className="event-date"><span>{event.startsAt ? new Date(event.startsAt).toLocaleDateString('en', { month: 'short' }).toUpperCase() : 'TBA'}</span><b>{event.startsAt ? new Date(event.startsAt).getDate() : '—'}</b></div><div className="event-info"><h3>{event.title}</h3><p>{event.location || 'School campus'} {event.startsAt ? `· ${new Date(event.startsAt).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}` : ''}</p></div><Link href={`/events/${event.slug}`} className="event-link" aria-label={`View ${event.title}`}>↗</Link></article>)}</div></div></section>}

      {staff.length > 0 && <section className="people-section section-space page-width"><div className="section-heading"><div><span className="eyebrow">THE PEOPLE BEHIND THE PURPOSE</span><h2>Meet our <em>educators.</em></h2><p>Dedicated people who inspire, guide, and support our learners.</p></div><Link href="/staff" className="text-link">Meet the full team <span>↗</span></Link></div><div className="people-grid">{staff.map((person, i) => <article className="person-card" key={person.id}><div className={`person-placeholder person-${i + 1}`}><span>{person.fullName.split(' ').map((part) => part[0]).join('')}</span></div><h3>{person.fullName}</h3><p>{person.roleTitle || person.department?.name || 'Our school team'}</p></article>)}</div></section>}

      <section className="closing-cta"><div className="page-width closing-inner"><div><span className="eyebrow eyebrow-light">YOUR NEXT CHAPTER STARTS HERE</span><h2>Come and see what<br/><em>you can become.</em></h2></div><div className="closing-actions"><p>Have questions about our school, programmes, or admissions? We would love to hear from you.</p><Link href="/contact" className="button-light">Get in touch <span>↗</span></Link></div></div></section>
    </div>
  );
}
