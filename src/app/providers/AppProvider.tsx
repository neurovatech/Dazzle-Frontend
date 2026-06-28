'use client';

import NextTopLoader from 'nextjs-toploader';
// import { Providers } from './providers';
import { useState } from 'react';

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted] = useState(true);

  if (!mounted) return null;

  return (
    <div>
      <NextTopLoader color="#d4a97a" showSpinner={false} />
      {children}
    </div>
  );
}

