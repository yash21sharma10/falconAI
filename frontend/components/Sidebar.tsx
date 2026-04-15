"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/campaigns", label: "Campaigns" },
  { href: "/leads", label: "Leads" }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white p-4 md:min-h-screen">
      <h1 className="text-xl font-bold mb-6">FalconAI</h1>
      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-blue-600" : "hover:bg-slate-800"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
