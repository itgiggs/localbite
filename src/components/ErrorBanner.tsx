export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-spicy/30 bg-red-50 px-4 py-3 text-sm font-medium text-spicy">
      {message}
    </div>
  );
}
