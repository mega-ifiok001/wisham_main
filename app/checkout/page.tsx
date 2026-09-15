import { Suspense } from 'react';
import { CheckoutView } from '@/components/CheckoutView';

export const metadata = {
  title: 'Confirming payment | WISHAM',
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-neutral-400 text-sm">
          Loading…
        </div>
      }
    >
      <CheckoutView />
    </Suspense>
  );
}