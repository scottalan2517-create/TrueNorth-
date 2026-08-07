export function Compass({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="16" r="14" stroke="#C9962E" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3" fill="#C9962E" />
      <polygon points="16,2 18,14 16,12 14,14" fill="#E0B968" />
      <polygon points="16,30 14,18 16,20 18,18" fill="#C9962E" />
      <polygon points="2,16 14,14 12,16 14,18" fill="#A8322B" />
      <polygon points="30,16 18,18 20,16 18,14" fill="#A8322B" />
    </svg>
  );
}
