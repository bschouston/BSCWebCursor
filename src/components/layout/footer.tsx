import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-transparent bg-footer-dark text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold">Burhani Sports Club Houston</h3>
            <p className="mt-1 text-sm text-white/70">
              Building community through sports
            </p>
          </div>
          <nav className="flex flex-wrap gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-white/60">
            © {new Date().getFullYear()} Burhani Sports Club Houston. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
