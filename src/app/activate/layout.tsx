import { Toaster } from '@/components/ui/toaster';

export default function ActivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
} 