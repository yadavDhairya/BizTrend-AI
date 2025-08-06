
export default function Logo() {
  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
            d="M6 26H26"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <rect x="7" y="18" width="5" height="8" fill="currentColor" rx="1"/>
        <rect x="13.5" y="12" width="5" height="14" fill="currentColor" rx="1"/>
        <rect x="20" y="6" width="5" height="20" fill="currentColor" rx="1"/>
      </svg>
    </div>
  );
}
