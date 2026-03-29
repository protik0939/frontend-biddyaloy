import Image from "next/image";
import Link from "next/link";

const sslCommerzLogoSmall =
  "https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-04.png";
const sslCommerzLogoMedium =
  "https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-05.png";
const sslCommerzLogoLarge =
  "https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Portal features", href: "#features" },
      { label: "Admissions workflow", href: "#features" },
      { label: "Academic operations", href: "#features" },
      { label: "Operator login", href: "/login" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Institution owners", href: "#home" },
      { label: "Departments", href: "#about" },
      { label: "Teachers", href: "#about" },
      { label: "Students", href: "#about" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Success stories", href: "#stories" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Support", href: "#" },
      { label: "Security", href: "#" },
      { label: "System status", href: "#" },
      { label: "Documentation", href: "#" },
    ],
  },
];

export default function FooterSection() {
  return (
    <footer className="relative border-t border-border bg-background/80 py-14">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50 dark:bg-[linear-gradient(to_right,rgba(248,250,252,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,250,252,0.06)_1px,transparent_1px)]" />
      <div className="mx-auto w-full lg:max-w-[80%] px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_0.7fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3">
              <Image
                src="/logo/Bidyaloylogo.svg"
                alt="Biddyaloy Logo"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-cyan-600 to-blue-700 text-sm font-bold text-white shadow-lg shadow-cyan-600/30"
                width={36}
                height={36}
              />
              <span className="text-lg font-semibold text-foreground">
                Biddyaloy
              </span>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              A SaaS portal platform for institutions to manage programs, people,
              and academic operations in one place.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Contact
              </p>
              <p>hello@biddyaloy.com</p>
              <p>+880 1234 567 890</p>
              <p>Dhaka, Bangladesh</p>
            </div>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                {column.title}
              </p>
              <div className="grid gap-2">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-10 w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Payment Partner
          </p>
          <Link
            target="_blank"
            href="https://www.sslcommerz.com/"
            title="SSLCommerz"
            rel="noopener noreferrer"
            className="inline-block w-full"
          >
            <Image
              src={sslCommerzLogoSmall}
              alt="SSLCommerz"
              width={1920}
              height={92}
              className="h-auto w-full md:hidden rounded-sm"
            />
            <Image
              src={sslCommerzLogoMedium}
              alt="SSLCommerz"
              width={1920}
              height={92}
              className="hidden h-auto w-full md:block lg:hidden rounded-sm"
            />
            <Image
              src={sslCommerzLogoLarge}
              alt="SSLCommerz"
              width={1920}
              height={92}
              className="hidden h-auto w-full lg:block rounded-sm"
            />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© 2026 Biddyaloy. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-foreground">
              Privacy policy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms of service
            </Link>
            <Link href="#" className="hover:text-foreground">
              Data processing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
