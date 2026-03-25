"use client";

import { useState } from "react";
import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";

type JobPosting = {
  id: string;
  institution: string;
  location: string;
  role: string;
  summary: string;
  details: string[];
  initials: string;
};

const postings: JobPosting[] = [
  {
    id: "job-1",
    institution: "Biddyaloy Academy",
    location: "Dhaka, Bangladesh",
    role: "Senior Mathematics Teacher",
    summary: "Lead senior math cohorts, mentor junior faculty, and own curriculum alignment.",
    details: [
      "Full-time role with campus leadership responsibilities.",
      "5+ years teaching experience, strong curriculum design background.",
      "Weekly mentoring sessions and data-driven assessment reviews.",
    ],
    initials: "BA",
  },
  {
    id: "job-2",
    institution: "Greenfield International",
    location: "Chattogram, Bangladesh",
    role: "Science Instructor",
    summary: "Deliver engaging STEM labs and coordinate inter-school science events.",
    details: [
      "Contract role with option to convert to full-time.",
      "Experience with lab safety and experiential learning required.",
      "Collaborate with operations for STEM club activities.",
    ],
    initials: "GI",
  },
  {
    id: "job-3",
    institution: "Nova City School",
    location: "Sylhet, Bangladesh",
    role: "English Language Specialist",
    summary: "Guide language arts curriculum and run writing improvement workshops.",
    details: [
      "Full-time role with literacy program ownership.",
      "TESOL or equivalent certification preferred.",
      "Quarterly workshops for writing and speaking proficiency.",
    ],
    initials: "NS",
  },
  {
    id: "job-4",
    institution: "Riverstone College",
    location: "Rajshahi, Bangladesh",
    role: "Physics Teacher",
    summary: "Lead senior physics classes and support lab modernization projects.",
    details: [
      "Full-time role with practical lab instruction focus.",
      "Experience with experiment-based learning preferred.",
      "Collaborate on term-wise assessment design.",
    ],
    initials: "RC",
  },
  {
    id: "job-5",
    institution: "Lakeview High",
    location: "Khulna, Bangladesh",
    role: "History and Civics Teacher",
    summary: "Deliver inquiry-driven history lessons and guide debate club sessions.",
    details: [
      "Full-time role with club leadership responsibilities.",
      "Strong classroom facilitation skills required.",
      "Experience with project-based learning is a plus.",
    ],
    initials: "LH",
  },
  {
    id: "job-6",
    institution: "Aurora International School",
    location: "Gazipur, Bangladesh",
    role: "Primary STEM Coach",
    summary: "Coach primary teachers on STEM integration and hands-on activities.",
    details: [
      "Full-time role supporting grades 1-5.",
      "Experience with maker labs or STEM clubs preferred.",
      "Monthly teacher development workshops.",
    ],
    initials: "AI",
  },
  {
    id: "job-7",
    institution: "Unity Model School",
    location: "Barishal, Bangladesh",
    role: "ICT Instructor",
    summary: "Teach digital literacy, coding basics, and tech-integrated lessons.",
    details: [
      "Full-time role with computer lab oversight.",
      "Comfortable teaching Scratch or web basics.",
      "Coordinate annual student tech fair.",
    ],
    initials: "UM",
  },
  {
    id: "job-8",
    institution: "Summit Preparatory",
    location: "Mymensingh, Bangladesh",
    role: "Chemistry Teacher",
    summary: "Lead chemistry labs and ensure safe, engaging practical sessions.",
    details: [
      "Full-time role with lab inventory management.",
      "Experience with practical assessments required.",
      "Support science fair planning and execution.",
    ],
    initials: "SP",
  },
  {
    id: "job-9",
    institution: "Brighton Academy",
    location: "Comilla, Bangladesh",
    role: "Early Childhood Educator",
    summary: "Design play-based learning routines and communicate progress with parents.",
    details: [
      "Full-time role for pre-primary program.",
      "Experience with Montessori or similar pedagogy preferred.",
      "Monthly parent engagement sessions.",
    ],
    initials: "BA",
  },
  {
    id: "job-10",
    institution: "Harborview School",
    location: "Rangpur, Bangladesh",
    role: "Economics Teacher",
    summary: "Guide senior economics curriculum and mentor business club leaders.",
    details: [
      "Full-time role with club sponsorship duties.",
      "Experience with exam board alignment preferred.",
      "Host quarterly economics case sessions.",
    ],
    initials: "HS",
  },
  {
    id: "job-11",
    institution: "Sunrise Public School",
    location: "Jessore, Bangladesh",
    role: "Bangla Literature Teacher",
    summary: "Lead literature circles and improve writing proficiency across grades.",
    details: [
      "Full-time role with writing lab coordination.",
      "Experience in curriculum mapping preferred.",
      "Support annual literary festival planning.",
    ],
    initials: "SP",
  },
  {
    id: "job-12",
    institution: "Evergreen School",
    location: "Narayanganj, Bangladesh",
    role: "Physical Education Coach",
    summary: "Run fitness sessions, sports teams, and student wellness initiatives.",
    details: [
      "Full-time role with sports event management.",
      "Coaching certification preferred.",
      "Coordinate inter-school tournaments.",
    ],
    initials: "ES",
  },
  {
    id: "job-13",
    institution: "Horizon College",
    location: "Bogura, Bangladesh",
    role: "Business Studies Teacher",
    summary: "Teach entrepreneurship fundamentals and coordinate enterprise projects.",
    details: [
      "Full-time role with project-based assessment focus.",
      "Experience with business simulations preferred.",
      "Mentor student enterprise club.",
    ],
    initials: "HC",
  },
];

export default function TeacherApply() {
  const [activePosting, setActivePosting] = useState<JobPosting | null>(null);

  return (
    <section className="mx-auto w-full max-w-[80%] px-4 py-28 md:px-6">
      <Reveal className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Teacher openings
        </p>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Apply to verified institutions hiring now.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Review curated roles, get a quick summary, and open full details before
          you apply.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {postings.map((posting, index) => (
          <Reveal
            key={posting.id}
            delayMs={index * 80}
            className="flex h-full flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-1 items-start gap-4">
              <div className="flex h-14 w-14 aspect-square items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                {posting.initials}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {posting.institution}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {posting.location}
                  </p>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {posting.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {posting.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActivePosting(posting)}
                className="rounded-full cursor-pointer border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                See more
              </button>
              <button
                type="button"
                className="rounded-full cursor-pointer bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Apply now
              </button>
            </div>
          </Reveal>
        ))}
      </div>

      {activePosting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {activePosting.institution}
                </p>
                <h2
                  id="job-modal-title"
                  className="mt-2 text-2xl font-semibold text-foreground"
                >
                  {activePosting.role}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activePosting.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePosting(null)}
                className="rounded-full cursor-pointer border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p>{activePosting.summary}</p>
              <ul className="list-disc space-y-2 pl-5">
                {activePosting.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-full cursor-pointer bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Apply now
              </button>
              <button
                type="button"
                onClick={() => setActivePosting(null)}
                className="rounded-full cursor-pointer border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                Back to listings
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
