/**
 * Focus ring for keyboard users (visible on focus-visible only).
 * Use on buttons, links, inputs, and other interactive elements.
 */
export const focusRing = [
  'focus:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-blue-500',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-slate-900',
].join(' ');

/**
 * Focus-within for containers (e.g. input wrapper).
 */
export const focusWithin = [
  'focus-within:ring-2',
  'focus-within:ring-blue-500/50',
].join(' ');
