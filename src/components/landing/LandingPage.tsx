"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Code2,
  GraduationCap,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";

type LandingPageProps = {
  isLoggedIn: boolean;
};

type SimpleCard = {
  title: string;
  text: string;
};

type HowStep = {
  step: string;
  title: string;
  summary: string;
  details: [string, string];
  panelTitle: string;
  panelRows: Array<{ label: string; value: string }>;
};

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const problems: SimpleCard[] = [
  { title: "You forget everything after cramming", text: "Short bursts feel productive, but memory fades fast." },
  { title: "Notes do not stick", text: "Passive reading creates familiarity, not durable recall." },
  { title: "Revision is inconsistent", text: "Without a system, hard topics get skipped and decay." },
  { title: "You waste hours re-learning", text: "Time goes to repeated recovery instead of true progress." },
];

const featureGrid = [
  {
    title: "AI Flashcard Generation",
    text: "Turn notes, prompts, and study material into clean card sets in seconds.",
  },
  {
    title: "Smart Review System",
    text: "Adaptive review timing keeps your recall strong with less wasted effort.",
  },
  {
    title: "Track Weak Topics",
    text: "Spot exactly where confidence drops and attack weak points first.",
  },
  {
    title: "Daily Study Streaks",
    text: "Stay disciplined with visible momentum and consistency cues.",
  },
  {
    title: "Topic-based Learning",
    text: "Organize by concept so every session has focused intent.",
  },
  {
    title: "Instant Recall Training",
    text: "Practice active recall with immediate feedback and retention loops.",
  },
];

const howSteps: HowStep[] = [
  {
    step: "01",
    title: "Upload notes or text",
    summary: "Bring your raw material in, and the system structures it instantly.",
    details: [
      "Paste notes, upload text, or import study documents without manual formatting.",
      "Flashcard Engine extracts concepts, definitions, and high-value recall prompts automatically.",
    ],
    panelTitle: "Input Pipeline",
    panelRows: [
      { label: "Sources", value: "Notes · PDF · Text" },
      { label: "Parsing", value: "Semantic chunks" },
      { label: "Output", value: "Clean study units" },
    ],
  },
  {
    step: "02",
    title: "AI generates flashcards",
    summary: "The model converts concepts into question-answer pairs ready to review.",
    details: [
      "Cards are generated for active recall, not passive rereading, improving retention quality.",
      "You can edit and curate cards so the final deck matches your exact learning intent.",
    ],
    panelTitle: "Generation Engine",
    panelRows: [
      { label: "Card style", value: "Recall-first" },
      { label: "Coverage", value: "Core + edge cases" },
      { label: "Controls", value: "Edit before publish" },
    ],
  },
  {
    step: "03",
    title: "Study daily with smart scheduling",
    summary: "Every review is timed to maximize memory strength with minimal waste.",
    details: [
      "Spaced repetition adapts intervals based on your rating performance per card.",
      "Hard cards return sooner, strong cards appear later, creating focused sessions.",
    ],
    panelTitle: "Adaptive Scheduler",
    panelRows: [
      { label: "Timing", value: "Dynamic intervals" },
      { label: "Priority", value: "Weak cards first" },
      { label: "Session", value: "Due-now queue" },
    ],
  },
  {
    step: "04",
    title: "Improve retention over time",
    summary: "Long-term memory compounds through consistent, data-driven review loops.",
    details: [
      "Track retention trends, weak topics, and streak consistency in one workflow.",
      "As your data grows, recommendations become sharper and your study load gets smarter.",
    ],
    panelTitle: "Progress Intelligence",
    panelRows: [
      { label: "Retention", value: "Trend monitored" },
      { label: "Weak spots", value: "Auto-detected" },
      { label: "Consistency", value: "Streak + volume" },
    ],
  },
];

const useCases = [
  { icon: <GraduationCap size={18} />, title: "Students preparing for exams" },
  { icon: <Code2 size={18} />, title: "Developers learning new tech" },
  { icon: <Trophy size={18} />, title: "Competitive exam aspirants" },
  { icon: <Brain size={18} />, title: "Lifelong learners" },
];

const heroTickerItems = [
  "AI flashcard generation",
  "Spaced repetition engine",
  "100% active recall",
  "Daily streak momentum",
  "Weak topic detection",
  "Retention tracking",
  "Study sessions that adapt",
];

const fabricThreads = [
  { id: 1, top: "12%", left: "4%", width: "44%", height: "3px", rotate: -13, duration: 10, delay: 0.1 },
  { id: 2, top: "18%", left: "24%", width: "50%", height: "2px", rotate: 11, duration: 11.2, delay: 0.15 },
  { id: 3, top: "24%", left: "10%", width: "58%", height: "3px", rotate: -7, duration: 9.4, delay: 0.05 },
  { id: 4, top: "31%", left: "34%", width: "46%", height: "2px", rotate: 8, duration: 10.8, delay: 0.22 },
  { id: 5, top: "39%", left: "6%", width: "64%", height: "3px", rotate: -10, duration: 9.9, delay: 0.18 },
  { id: 6, top: "46%", left: "20%", width: "56%", height: "2px", rotate: 6, duration: 10.6, delay: 0.12 },
  { id: 7, top: "54%", left: "12%", width: "60%", height: "3px", rotate: -8, duration: 11.1, delay: 0.25 },
  { id: 8, top: "62%", left: "28%", width: "48%", height: "2px", rotate: 9, duration: 10.2, delay: 0.08 },
  { id: 9, top: "70%", left: "8%", width: "66%", height: "3px", rotate: -6, duration: 11.4, delay: 0.2 },
  { id: 10, top: "78%", left: "30%", width: "52%", height: "2px", rotate: 7, duration: 10.1, delay: 0.14 },
] as const;

const faqItems = [
  {
    question: "What is spaced repetition?",
    answer:
      "Spaced repetition is a learning method that schedules review right before you are likely to forget. Flashcard Engine adapts this timing per card so you retain more with less total study time.",
  },
  {
    question: "Is this free?",
    answer:
      "Yes. You can start with a free experience and core study workflows. Advanced limits and premium capabilities can be expanded later without changing your decks.",
  },
  {
    question: "Can I upload PDFs?",
    answer:
      "Yes. You can upload PDF content and convert it into structured flashcards. The system extracts key points and helps organize them by topic.",
  },
  {
    question: "How does AI generate flashcards?",
    answer:
      "The AI analyzes your notes or source material, identifies high-value concepts, and drafts question-answer pairs optimized for active recall. You can edit, filter, and review before studying.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Your study sessions and existing decks can continue without interruption. Some AI generation and sync features may require internet when creating new content.",
  },
];

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Section({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      {children}
    </section>
  );
}

export default function LandingPage({ isLoggedIn }: LandingPageProps) {
  const primaryHref = isLoggedIn ? "/dashboard" : "/register";
  const authHref = isLoggedIn ? "/dashboard" : "/login";
  const [activeHowStep, setActiveHowStep] = useState(1);
  const activeStep = howSteps[activeHowStep];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#151515] text-white">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "56px 56px"] }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='2' cy='2' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-[0.08em] text-white">
            Flashcard Engine
          </Link>
        </div>
      </header>

      <motion.div
        className="fixed top-4 right-4 z-40"
      >
        <Link
          href={authHref}
          className="rounded-full border border-[#ff3b00]/50 bg-black/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#ff6a3d] backdrop-blur-md transition hover:border-[#ff6a3d] hover:text-[#ff9a7c]"
        >
          {isLoggedIn ? "Dashboard" : "Login"}
        </Link>
      </motion.div>

      <main className="relative z-10">
        <section id="hero" className="relative overflow-hidden border-b border-black/30 bg-[#d74c43] text-black">
          <div className="hero-screen-effect" aria-hidden="true" />
          <div className="relative z-10 mx-auto grid min-h-[76vh] w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:py-24">
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-black/75">
                Your brain. Upgraded.
              </p>
              <h1 className="max-w-xl text-4xl font-bold leading-[0.98] tracking-tight text-black sm:text-5xl lg:text-6xl">
                Study smarter. Remember forever.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-black/75 sm:text-lg">
                AI-powered flashcards that adapt to your brain. Learn faster, retain longer, and never forget what matters.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={primaryHref}
                  className="inline-flex items-center gap-2 rounded-md bg-[#050505] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f0f0f]"
                >
                  Start Studying <ArrowRight size={16} />
                </Link>
                <Link
                  href="#preview"
                  className="inline-flex items-center rounded-md border border-black/35 px-5 py-3 text-sm font-semibold text-black transition hover:bg-black/10"
                >
                  View Demo
                </Link>
              </div>
            </Reveal>
          </div>
          <svg
            className="hero-watermark-glitch pointer-events-none absolute bottom-[-25%] right-[-3%] z-2 w-[52vw] min-w-60 text-white/35"
            viewBox="0 0 163 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M162.809 89.4121H82.6844C74.7832 89.4121 67.2059 92.5528 61.6216 98.1424C56.0441 103.725 52.9111 111.294 52.9111 119.185V159.996H72.1703V126.45C72.1703 116.812 72.3437 108.001 72.3437 108.001H162.809V89.4121Z"
              fill="currentColor"
            />
            <path
              d="M162.808 118.61H111.815C103.914 118.61 96.3368 121.751 90.7524 127.341C85.1749 132.923 82.042 140.492 82.042 148.384V159.997H104.909V144.052C104.909 134.414 104.909 134.082 104.909 134.082H162.808V118.61Z"
              fill="currentColor"
            />
            <path
              d="M162.809 146.002C144.706 146.002 134.567 145.996 116.464 146.004V160H162.809V146.002Z"
              fill="currentColor"
            />
            <path
              d="M162.809 0.00304711H70.8863C52.0802 0.00304711 34.0448 7.47609 20.7501 20.7772C7.46368 34.07 0 52.0946 0 70.8889C0 99.2859 0 140.767 0 159.997H15.7849V67.7138C15.7849 53.2572 15.7849 41.5373 15.7849 41.5373H162.812V0L162.809 0.00304711Z"
              fill="currentColor"
            />
            <path
              d="M162.809 51.8704H56.8042C48.903 51.8704 41.3258 55.0111 35.7414 60.6008C30.1639 66.1835 27.031 73.7522 27.031 81.6437V159.997H41.8159V96.3178C41.8159 86.6801 41.8159 78.8688 41.8159 78.8688H162.809V51.8674V51.8704Z"
              fill="currentColor"
            />
          </svg>
          <div className="hero-ticker" aria-hidden="true">
            <div className="hero-ticker-inner">
              {[...heroTickerItems, ...heroTickerItems].flatMap((item, index, list) => [
                <span key={`item-${item}-${index}`} className="hero-ticker-item">{item}</span>,
                ...(index < list.length - 1
                  ? [<span key={`dot-${item}-${index}`} className="hero-ticker-dot">•</span>]
                  : []),
              ])}
            </div>
          </div>
        </section>

        <Section id="problem">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">You are studying wrong.</h2>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {problems.map((problem) => (
                <div key={problem.title} className="relative overflow-hidden rounded-xl border border-white/10 bg-[#151515] p-5">
                  <div className="absolute left-0 top-0 h-px w-full bg-linear-to-r from-transparent via-[#ff3b00] to-transparent opacity-70" />
                  <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{problem.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Section>

        <Section id="solution">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Let AI handle your memory.</h2>
            <p className="mt-4 max-w-3xl text-zinc-300">
              Our system uses spaced repetition and AI to show you exactly what you need, when you need it.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Smart scheduling (spaced repetition)",
                "Weak spot detection",
                "AI-generated flashcards",
                "Progress tracking",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-[#151515] p-4 text-sm text-zinc-200">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-[#ff3b00]/30 bg-[#151515] p-5">
              <div className="grid items-center gap-3 text-center text-sm sm:grid-cols-5">
                {[
                  "Input",
                  "AI",
                  "Flashcards",
                  "Review",
                  "Retain",
                ].map((node, index) => (
                  <div key={node} className="flex items-center justify-center gap-2">
                    <span className="rounded-md border border-[#ff3b00]/40 px-3 py-2 text-zinc-100">{node}</span>
                    {index < 4 ? <ArrowRight size={14} className="text-[#ff6a3d]" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Section>

        <Section id="features">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for focused performance.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureGrid.map((feature, index) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-white/10 bg-[#151515] p-5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6a3d]">
                    [{` ${String(index + 1).padStart(2, "0")} `}]
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Section>

        <Section id="how-it-works">
          <Reveal>
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6a3d]">Our Approach</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Purpose beats scale.</h2>
              <p className="max-w-3xl text-zinc-300">
                Flashcard Engine combines AI generation, adaptive scheduling, and progress feedback as one continuous learning loop.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                {howSteps.map((step, index) => {
                  const active = activeHowStep === index;

                  return (
                    <button
                      key={step.step}
                      type="button"
                      onClick={() => setActiveHowStep(index)}
                      className={`w-full rounded-xl border bg-[#151515] p-4 text-left transition ${
                        active
                          ? "border-[#ff3b00]/45 bg-[#171717]"
                          : "border-white/10 hover:border-[#ff3b00]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6a3d]">
                          Step {step.step}
                        </p>
                        <span
                          className={`h-1.5 w-14 rounded-full ${
                            active ? "bg-[#ff3b00]" : "bg-white/10"
                          }`}
                        />
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-zinc-100">{step.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{step.summary}</p>

                      {active ? (
                        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                          <p className="text-sm leading-6 text-zinc-400">{step.details[0]}</p>
                          <p className="text-sm leading-6 text-zinc-500">{step.details[1]}</p>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] p-5">
                <div
                  className="absolute inset-0 opacity-95"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 10px), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 14px), radial-gradient(circle at 20% 18%, rgba(255,255,255,0.03) 0 12%, transparent 30%), radial-gradient(circle at 78% 68%, rgba(255,255,255,0.025) 0 10%, transparent 28%)",
                  }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  animate={{ backgroundPosition: ["0px 0px", "24px 18px"] }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 100%), linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 100%)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="absolute inset-0">
                  {fabricThreads.map((thread) => {
                    return (
                      <motion.div
                        key={thread.id}
                        className="absolute rounded-full bg-[#1b1b1b]"
                        style={{
                          top: thread.top,
                          left: thread.left,
                          width: thread.width,
                          height: thread.height,
                          rotate: `${thread.rotate}deg`,
                        }}
                        animate={{
                          backgroundColor: "#1b1b1b",
                          opacity: [0.68, 0.84, 0.68],
                          x: [0, 2, 0],
                          y: [0, -1, 0],
                        }}
                        transition={{
                          duration: thread.duration,
                          delay: thread.delay,
                          repeat: Infinity,
                          repeatType: "mirror",
                          ease: "easeInOut",
                        }}
                      />
                    );
                  })}
                </div>

                <div className="relative z-10 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6a3d]">Live Trace</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{activeStep.panelTitle}</h3>

                  <div className="mt-4 space-y-2">
                    {activeStep.panelRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between rounded-md border border-white/10 bg-[#111111]/90 px-3 py-2"
                      >
                        <span className="text-xs uppercase tracking-wide text-zinc-400">{row.label}</span>
                        <span className="text-sm font-medium text-zinc-100">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-md border border-[#ff3b00]/35 bg-black/30 p-3">
                    <p className="text-xs uppercase tracking-wide text-zinc-400">Flow</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-200">
                      <span className="rounded border border-[#ff3b00]/40 px-2 py-1">Input</span>
                      <ArrowRight size={12} className="text-[#ff6a3d]" />
                      <span className="rounded border border-[#ff3b00]/40 px-2 py-1">AI</span>
                      <ArrowRight size={12} className="text-[#ff6a3d]" />
                      <span className="rounded border border-[#ff3b00]/40 px-2 py-1">Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        <Section id="benefits">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Performance that compounds.</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["2x", "faster learning"],
                ["90%", "retention improvement"],
                ["AI", "personalized learning"],
                ["Daily", "built for consistency"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-[#151515] p-4 text-center">
                  <p className="text-3xl font-bold text-[#ff6a3d]">{value}</p>
                  <p className="mt-1 text-sm text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Section>

        <Section id="use-cases">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Who this is for</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-[#151515] p-4">
                  <div className="mb-3 inline-flex rounded-md border border-[#ff3b00]/40 p-2 text-[#ff6a3d]">{item.icon}</div>
                  <p className="text-sm text-zinc-200">{item.title}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Section>

        <Section id="preview">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Product preview</h2>
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#151515] p-5 shadow-[0_0_35px_rgba(255,59,0,0.15)]">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-[#151515] p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Flashcards</p>
                  <div className="mt-3 space-y-2">
                    <div className="rounded border border-[#ff3b00]/30 bg-[#140b08] p-3 text-sm">AI card: Networking basics</div>
                    <div className="rounded border border-white/10 p-3 text-sm">Prompt card: OSI layers</div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#151515] p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Progress graph</p>
                  <div className="mt-4 flex h-28 items-end gap-2">
                    {[32, 44, 26, 61, 72, 80, 74].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-linear-to-t from-[#ff3b00] to-[#ff6a3d]" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#151515] p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Weak topics</p>
                  <div className="mt-3 space-y-2 text-sm text-zinc-200">
                    <div className="flex items-center justify-between rounded border border-white/10 px-3 py-2"><span>Databases</span><span className="text-[#ff6a3d]">42%</span></div>
                    <div className="flex items-center justify-between rounded border border-white/10 px-3 py-2"><span>Algorithms</span><span className="text-[#ff6a3d]">48%</span></div>
                    <div className="flex items-center justify-between rounded border border-white/10 px-3 py-2"><span>Systems</span><span className="text-[#ff6a3d]">54%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        <Section id="cta">
          <Reveal className="rounded-2xl border border-[#ff3b00]/35 bg-[#151515] p-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your brain deserves better.</h2>
            <p className="mx-auto mt-3 max-w-xl text-zinc-300">Start building long-term memory today.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href={primaryHref} className="rounded-md bg-[#ff3b00] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6a3d]">
                Start for Free
              </Link>
              <Link href="/dashboard" className="rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/35 hover:bg-white/5">
                Go to Dashboard
              </Link>
            </div>
          </Reveal>
        </Section>

        <Section id="faq">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions.</h2>
            <div className="mx-auto mt-8 max-w-3xl divide-y divide-white/10 rounded-xl border border-white/10 bg-[#151515]">
              {faqItems.map((item, index) => (
                <div key={item.question} className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex((current) => (current === index ? null : index))}
                    className="flex w-full cursor-pointer items-start gap-3 text-left text-sm font-medium text-zinc-200"
                    aria-expanded={openFaqIndex === index}
                  >
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#ff6a3d]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">{item.question}</span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openFaqIndex === index ? (
                      <motion.div
                        key="faq-answer"
                        initial={{ height: 0, opacity: 0, y: -4 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -4 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-sm text-zinc-400">
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Reveal>
        </Section>

        <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-zinc-400">Flashcard Engine</p>
            <p className="text-sm text-zinc-500">Study smarter with spaced repetition and AI.</p>
            <Link href={primaryHref} className="text-sm font-medium text-[#ff6a3d] transition hover:text-[#ff9a7c]">
              {isLoggedIn ? "Go to Dashboard" : "Start Studying"}
            </Link>
          </div>
        </footer>
      </main>
    </div>

    
  );
}


