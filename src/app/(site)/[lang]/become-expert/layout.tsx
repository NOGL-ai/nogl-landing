export default function BecomeExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900">
      {children}
    </div>
  );
} 