import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";

const steps = [
  { icon: MapPin, title: "Share what you know", text: "Add the event name, place, dates and story behind a local celebration." },
  { icon: ShieldCheck, title: "Our team reviews it", text: "Every submission is checked by an administrator before it appears publicly." },
  { icon: CheckCircle2, title: "Help people discover it", text: "Once approved, your event joins the city calendar for everyone to explore." },
];

export default function ContributePage() {
  return <main className="page-enter">
    <section className="page-head"><div className="shell"><span className="eyebrow">A community calendar</span><h1>Local traditions deserve to be seen.</h1><p>Help more people find the festivals, fairs and gatherings that make your city unique.</p></div></section>
    <section className="section"><div className="shell contribute-page-grid"><div><span className="eyebrow">Why contribute</span><h2>Every neighbourhood has a story worth sharing.</h2><p className="contribute-intro">Many meaningful cultural events are shared through word of mouth. Your knowledge helps residents and visitors discover them, plan ahead and understand the traditions behind each gathering.</p><Link className="button button-primary" href="/contributor/submit">Submit an Event <ArrowRight size={16}/></Link></div>
      <div className="contribution-steps">{steps.map(({ icon: Icon, title, text }, index) => <article className="contribution-step" key={title}><span className="contribution-icon"><Icon size={19}/></span><div><span className="contribution-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </div></section>
    <section className="section section-soft"><div className="shell contribution-note"><div><span className="eyebrow">Thoughtful, verified listings</span><h2>Clear details make every listing more useful.</h2><p>Include accurate dates and venue information, a helpful description, and the cultural significance of the event. Submissions stay private while pending review.</p></div><Link className="text-link" href="/explore">Explore current events <ArrowRight size={15}/></Link></div></section>
  </main>;
}
