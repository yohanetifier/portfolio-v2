'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
const SOCIAL_LINKS = [
  { label: 'GITHUB', href: 'https://github.com/yohanetifier' },
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/yohanetifier/' },
] as const;

export default function Contact() {
  const date = new Date();
  const init = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  const [now, setNow] = useState(init);

  useEffect(() => {
    setInterval(() => {
      const date = new Date();
      setNow(
        `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      );
    }, 30000);
  }, []);

  return (
    <main className="relative z-[2] min-h-screen flex items-center bg-[#f4f3f0] text-black px-[8vw] md:px-[10vw]">
      <div className="w-full max-w-[1120px]">
        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] mb-6 md:mb-8">
          [ UN PROJET ? ]
        </p>

        <a
          href="mailto:contact@yohanetifier.com"
          className="block font-sans font-bold text-[clamp(2.5rem,9vw,5.5rem)] leading-[0.95] tracking-[-0.02em] mb-10 md:mb-14 cursor-none"
          data-cursor
        >
          contact@yohanetifier.com
        </a>

        <nav className="flex flex-wrap gap-x-10 md:gap-x-16 gap-y-3 mb-10 md:mb-12">
          {SOCIAL_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] cursor-none"
              data-cursor
            >
              {label} ↗
            </Link>
          ))}
        </nav>

        <div className="h-px w-full bg-black/80 mb-4 md:mb-5" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] md:text-[11px] uppercase tracking-[0.12em]">
          <p className="flex items-center gap-2">
            <span aria-hidden className="text-[8px] leading-none">
              ●
            </span>
            Disponible pour de nouveaux projets
          </p>
          <p className="sm:text-right">
            Paris — <span>{now}</span>
          </p>
        </div>
      </div>
    </main>
  );
}
