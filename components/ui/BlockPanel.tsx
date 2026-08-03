import type { ReactNode } from 'react';

export function BlockPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mc-block p-4 ${className}`}>{children}</div>;
}
