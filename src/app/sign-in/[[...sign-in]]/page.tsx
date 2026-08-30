'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] p-4 text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-indigo-500/30 shadow-lg bg-black flex items-center justify-center">
          <img src="/logo.png" alt="FlowCreator OS" className="h-full w-full object-contain p-0.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold tracking-tight text-white bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            FlowCreator
          </span>
          <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/30">
            OS
          </span>
        </div>
      </div>

      <div className="w-full max-w-md">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              card: 'bg-[#121216] border border-zinc-800 shadow-2xl rounded-2xl backdrop-blur-xl',
              headerTitle: 'text-white font-bold',
              headerSubtitle: 'text-zinc-400 text-xs',
              formButtonPrimary: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold text-xs py-2.5 shadow-md shadow-indigo-500/20',
              formFieldInput: 'bg-zinc-900 border-zinc-800 text-white text-xs rounded-xl focus:border-indigo-500',
              footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-semibold text-xs',
              socialButtonsBlockButton: 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white text-xs rounded-xl',
              dividerLine: 'bg-zinc-800',
              dividerText: 'text-zinc-500 text-xs',
            },
          }}
        />
      </div>
    </div>
  );
}
