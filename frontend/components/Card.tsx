import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function Card({ title, children, actions }: CardProps) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : <span />}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
