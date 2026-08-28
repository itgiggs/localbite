export function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border-2 ${
        isVeg ? 'border-veg' : 'border-spicy'
      }`}
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isVeg ? 'bg-veg' : 'bg-spicy'}`} />
    </span>
  );
}

export function SpicyBadge() {
  return (
    <span title="Spicy" aria-label="Spicy" className="text-sm">
      🌶️
    </span>
  );
}

export function StatusBadge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}
