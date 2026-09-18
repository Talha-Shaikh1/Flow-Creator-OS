import React from 'react';

export function YouTubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <defs>
        <radialGradient id="ig-grad" cx="20%" cy="110%" r="130%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="#ffffff" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#ffffff" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="#ffffff" strokeWidth="2" />
    </svg>
  );
}

export function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fill="#00F2FE"
        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.89 2.89 0 0 1-2.882 2.882 2.89 2.89 0 0 1-2.883-2.882 2.89 2.89 0 0 1 2.883-2.882c.31 0 .607.05.885.143v-3.52a6.326 6.326 0 0 0-.885-.062 6.333 6.333 0 0 0-6.33 6.321 6.333 6.333 0 0 0 6.33 6.32 6.333 6.333 0 0 0 6.33-6.32V8.92a8.214 8.214 0 0 0 4.773 1.517v-3.44a4.818 4.818 0 0 1-1.006-.311z"
      />
      <path
        fill="#FE2C55"
        d="M18.583 6.375a4.793 4.793 0 0 1-3.77-4.245V2h-1.445v13.672a4.89 4.89 0 0 1-4.882 4.882 4.89 4.89 0 0 1-4.883-4.882 4.89 4.89 0 0 1 4.883-4.882c.31 0 .607.05.885.143v-1.52a6.326 6.326 0 0 0-.885-.062 6.333 6.333 0 0 0-6.33 6.321 6.333 6.333 0 0 0 6.33 6.32 6.333 6.333 0 0 0 6.33-6.32V8.92a8.214 8.214 0 0 0 4.773 1.517v-3.44a4.818 4.818 0 0 1-1.006-.622z"
      />
      <path
        fill="#FFFFFF"
        d="M16.49 5.864a4.793 4.793 0 0 1-3.77-4.245V1h-2v13.672a2.89 2.89 0 0 1-2.882 2.882 2.89 2.89 0 0 1-2.883-2.882 2.89 2.89 0 0 1 2.883-2.882c.31 0 .607.05.885.143v-3.52a6.326 6.326 0 0 0-.885-.062 6.333 6.333 0 0 0-6.33 6.321 6.333 6.333 0 0 0 6.33 6.32 6.333 6.333 0 0 0 6.33-6.32V8.1a8.214 8.214 0 0 0 4.773 1.517V6.177a4.818 4.818 0 0 1-1.006-.313z"
      />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
      <path
        fill="#FFFFFF"
        d="M16.67 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.514V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.643H7.078v3.47h3.047v8.385a12.14 12.14 0 0 0 3.75 0v-8.385h2.795z"
      />
    </svg>
  );
}
