"use client";

import type { ReactNode } from "react";

/** Форма с серверным экшеном, авто-сабмит при изменении любого контрола. */
export function AutoSubmitForm({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onChange={(e) => {
        if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) {
          e.currentTarget.requestSubmit();
        }
      }}
    >
      {children}
    </form>
  );
}
