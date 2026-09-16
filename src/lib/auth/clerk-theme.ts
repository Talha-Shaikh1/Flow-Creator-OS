import { dark } from '@clerk/themes';

/**
 * Clerk theme appearance definition matching FlowCreator OS dark cinematic aesthetic.
 * Utilizes Clerk's official dark baseTheme combined with explicit white text,
 * high-contrast inputs, and ultra-visible glowing OTP verification fields.
 */
export const flowCreatorClerkTheme = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#6366f1', // Indigo
    colorBackground: '#121215', // Sleek dark surface
    colorInputBackground: '#18181b', // Crisp contrasting dark input
    colorInputText: '#ffffff', // High-contrast pure white
    colorText: '#ffffff', // High-contrast pure white
    colorTextSecondary: '#d4d4d8', // Light zinc subtext
    colorTextOnPrimaryBackground: '#ffffff',
    colorDanger: '#f43f5e',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    borderRadius: '0.875rem',
    fontFamily: 'inherit',
  },
  elements: {
    // Main Container & Card
    card: '!bg-[#121215] !border !border-neutral-800 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 rounded-2xl p-6 sm:p-8',
    rootBox: 'w-full flex justify-center',
    cardBox: 'w-full max-w-md shadow-none',

    // Headers & Titles
    headerTitle: '!text-white font-black tracking-tight text-xl sm:text-2xl',
    headerSubtitle: '!text-neutral-300 text-xs leading-relaxed mt-1',

    // Social & OAuth Buttons (Google, etc.)
    socialButtonsBlockButton:
      '!bg-[#18181b] !border !border-neutral-700 hover:!bg-neutral-800 hover:!border-neutral-600 !text-white transition-all rounded-xl py-2.5 px-4 font-semibold text-xs shadow-sm cursor-pointer',
    socialButtonsBlockButtonText: '!text-white font-semibold text-xs',
    socialButtonsProviderIcon: 'w-4 h-4',

    // Dividers
    dividerLine: '!bg-neutral-700',
    dividerText: '!text-neutral-300 text-[10px] uppercase font-bold tracking-widest px-2',

    // Form Fields & Inputs
    formFieldLabel: '!text-neutral-200 text-xs font-semibold mb-1.5',
    formFieldInput:
      '!bg-[#18181b] !border !border-neutral-700 !text-white rounded-xl focus:!border-indigo-500 focus:!ring-2 focus:!ring-indigo-500/30 transition text-sm py-2.5 px-3.5 placeholder-neutral-400 shadow-inner',
    formFieldErrorText: '!text-rose-400 text-xs mt-1 font-medium',

    // Primary Action Buttons
    formButtonPrimary:
      'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 !text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer text-xs uppercase tracking-wider',

    // Footers & Navigation Links
    footer: 'bg-transparent border-t border-neutral-800/80 pt-4 mt-4',
    footerAction: '!text-neutral-300 text-xs',
    footerActionText: '!text-neutral-300 text-xs',
    footerActionLink: '!text-indigo-400 hover:!text-indigo-300 font-bold text-xs transition underline-offset-4 hover:underline',

    // Identity preview (e.g. email when entering OTP)
    identityPreview: '!bg-[#18181b] !border !border-neutral-700 rounded-xl p-3',
    identityPreviewText: '!text-white font-bold text-xs',
    identityPreviewEditButton: '!text-indigo-400 hover:!text-indigo-300 text-xs font-semibold',
    identityPreviewEditButtonIcon: '!text-indigo-400',

    // OTP Code Verification Screen & Fields
    otpCodeFieldInputs: 'gap-2 sm:gap-3 flex justify-center my-4',
    otpCodeFieldInput:
      '!bg-[#18181b] !border-2 !border-indigo-500 !text-white !font-mono !text-2xl !font-black !rounded-xl !w-12 !h-14 !text-center focus:!border-indigo-400 focus:!ring-4 focus:!ring-indigo-500/40 !transition-all !shadow-lg focus:!scale-105',
    formResendCodeLink: '!text-indigo-400 hover:!text-indigo-300 text-xs font-bold cursor-pointer underline-offset-4 hover:underline',

    // Modal Dialog Overrides
    modalBackdrop: 'bg-black/90 backdrop-blur-md',
    modalContent: '!bg-[#121215] !border !border-neutral-700 backdrop-blur-2xl rounded-2xl shadow-2xl p-0 overflow-hidden',
    modalCloseButton: '!text-neutral-300 hover:!text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg p-1.5 transition',

    // Alert & Warnings
    alert: '!bg-rose-500/15 !border !border-rose-500/40 !text-rose-200 rounded-xl p-3 text-xs font-medium',
    alertText: '!text-rose-200 text-xs',

    // User Profile Button & Popover
    userButtonPopoverCard: '!bg-[#121215] !border !border-neutral-700 backdrop-blur-xl shadow-2xl rounded-2xl p-2',
    userButtonPopoverActionButton: 'hover:!bg-neutral-800 !text-white text-xs rounded-xl transition',
    userButtonPopoverActionButtonText: '!text-white text-xs font-medium',
    userButtonPopoverFooter: 'hidden',
  },
};
