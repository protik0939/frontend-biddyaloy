"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
	title: string;
	description: string;
	contextLabel: string;
	error: Error & { digest?: string };
	reset: () => void;
};

export default function ErrorPage({
	title,
	description,
	contextLabel,
	error,
	reset,
}: ErrorPageProps) {
	useEffect(() => {
		console.error(`${contextLabel} Error:`, error);
	}, [contextLabel, error]);

	return (
		<section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(31,111,139,0.12),transparent_55%)]" />
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />
			<div className="relative w-full">
				<div className="rounded-3xl p-8 md:px-32">
					<div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-center md:gap-10">
						<div className="flex h-auto md:w-1/3 items-center justify-center animate-[error-float_6s_ease-in-out_infinite]">
							<Image
								src="/logo/BidyaloyErrorLogo.svg"
								alt="Error"
								className="w-full"
								width={64}
								height={64}
								priority
							/>
						</div>
						<div className="flex-1 space-y-3">
							<p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
								{contextLabel} portal
							</p>
							<h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
								{title}
							</h1>
							<p className="text-sm text-slate-600 md:text-base">
								{description}
							</p>
							{error.message && (
								<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
									{error.message}
								</div>
							)}
							<div className="flex flex-wrap gap-3 pt-2">
								<button
									onClick={() => reset()}
									className="rounded-xl cursor-pointer bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
								>
									Try again
								</button>
								<Link
									href="/"
									className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
								>
									Back to home
								</Link>
							</div>
						</div>
					</div>
				</div>
				<div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl animate-[error-pulse_5s_ease-in-out_infinite]" />
				<div className="pointer-events-none absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl animate-[error-pulse_6s_ease-in-out_infinite]" />
			</div>
		</section>
	);
}
