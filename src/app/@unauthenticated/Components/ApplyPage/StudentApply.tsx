"use client";

import { useState } from "react";
import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";

type StudentProgram = {
  id: string;
  institution: string;
  location: string;
  program: string;
  summary: string;
  details: string[];
  initials: string;
};

const programs: StudentProgram[] = [
  {
    id: "program-1",
    institution: "Biddyaloy Academy",
    location: "Dhaka, Bangladesh",
    program: "STEM Scholars (Grade 9-10)",
    summary: "Project-based STEM track with lab sessions and mentorship.",
    details: [
      "Weekly lab rotations and mentorship hours.",
      "Scholarship opportunities for top performers.",
      "Entrance test and interview required.",
    ],
    initials: "BA",
  },
  {
    id: "program-2",
    institution: "Greenfield International",
    location: "Chattogram, Bangladesh",
    program: "Business & Leadership (Grade 11-12)",
    summary: "Business fundamentals with leadership workshops and case studies.",
    details: [
      "Capstone project with local businesses.",
      "Leadership bootcamp each semester.",
      "Portfolio-based assessment.",
    ],
    initials: "GI",
  },
  {
    id: "program-3",
    institution: "Nova City School",
    location: "Sylhet, Bangladesh",
    program: "Language Arts Honors (Grade 6-8)",
    summary: "Advanced reading, writing, and speaking track.",
    details: [
      "Monthly writing workshops with guest mentors.",
      "Public speaking showcase each term.",
      "Reading list with guided discussions.",
    ],
    initials: "NS",
  },
  {
    id: "program-4",
    institution: "Riverstone College",
    location: "Rajshahi, Bangladesh",
    program: "Science Foundation (Grade 7-9)",
    summary: "Hands-on science exploration with guided lab work.",
    details: [
      "Weekly lab sessions and science journal reviews.",
      "Term-end science fair showcase.",
      "Mentoring from senior faculty.",
    ],
    initials: "RC",
  },
  {
    id: "program-5",
    institution: "Lakeview High",
    location: "Khulna, Bangladesh",
    program: "Humanities Track (Grade 9-10)",
    summary: "Focus on history, civics, and debate-focused learning.",
    details: [
      "Weekly debate club participation.",
      "Civic engagement project each term.",
      "Research-based assessments.",
    ],
    initials: "LH",
  },
  {
    id: "program-6",
    institution: "Aurora International School",
    location: "Gazipur, Bangladesh",
    program: "Primary Explorers (Grade 1-3)",
    summary: "Inquiry-led primary program with creative learning routines.",
    details: [
      "Daily guided exploration sessions.",
      "Parent engagement every month.",
      "Foundational literacy and numeracy focus.",
    ],
    initials: "AI",
  },
  {
    id: "program-7",
    institution: "Summit Preparatory",
    location: "Mymensingh, Bangladesh",
    program: "Lab Science (Grade 10-12)",
    summary: "Advanced lab science program with college preparation.",
    details: [
      "Lab safety certification included.",
      "Weekly mentorship sessions with advisors.",
      "Entrance exam required for admission.",
    ],
    initials: "SP",
  },
  {
    id: "program-8",
    institution: "Brighton Academy",
    location: "Comilla, Bangladesh",
    program: "Early Learners (Pre-Primary)",
    summary: "Play-based learning with structured routines and care.",
    details: [
      "Montessori-style activity stations.",
      "Weekly family updates and feedback.",
      "Health and safety monitoring daily.",
    ],
    initials: "BA",
  },
  {
    id: "program-9",
    institution: "Harborview School",
    location: "Rangpur, Bangladesh",
    program: "Commerce Plus (Grade 11-12)",
    summary: "Commerce track with accounting labs and market simulations.",
    details: [
      "Accounting labs twice per week.",
      "Business club and enterprise project.",
      "Mock exam preparation sessions.",
    ],
    initials: "HS",
  },
];

export default function StudentApply() {
  const [activeProgram, setActiveProgram] = useState<StudentProgram | null>(null);

  return (
    <section className="mx-auto w-full max-w-[80%] px-4 py-28 md:px-6">
      <Reveal className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Student admissions
        </p>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Find the right program and apply in minutes.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browse verified programs, compare requirements, and submit your
          application confidently.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program, index) => (
          <Reveal
            key={program.id}
            delayMs={index * 80}
            className="flex h-full flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-1 items-start gap-4">
              <div className="flex h-14 w-14 aspect-square items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                {program.initials}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {program.institution}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {program.location}
                  </p>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {program.program}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {program.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveProgram(program)}
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

      {activeProgram ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="program-modal-title"
            className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {activeProgram.institution}
                </p>
                <h2
                  id="program-modal-title"
                  className="mt-2 text-2xl font-semibold text-foreground"
                >
                  {activeProgram.program}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeProgram.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveProgram(null)}
                className="rounded-full cursor-pointer border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p>{activeProgram.summary}</p>
              <ul className="list-disc space-y-2 pl-5">
                {activeProgram.details.map((detail) => (
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
                onClick={() => setActiveProgram(null)}
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
