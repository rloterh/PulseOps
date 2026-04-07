'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function FocusBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const boundaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boundaryRef.current || typeof document === 'undefined') {
      return;
    }

    if (document.activeElement && document.activeElement !== document.body) {
      return;
    }

    boundaryRef.current.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div id="main-content" ref={boundaryRef} tabIndex={-1}>
      {children}
    </div>
  );
}
