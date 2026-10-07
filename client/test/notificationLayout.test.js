import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Starting Notification Layout & Mobile Responsiveness Test Suite ---');

const popoverPath = path.resolve(__dirname, '../src/components/common/NotificationPopover.jsx');
const layoutPath = path.resolve(__dirname, '../src/layouts/AppLayout.jsx');

const popoverContent = fs.readFileSync(popoverPath, 'utf8');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

// Test 1: Mobile Backdrop Overlay exists
assert(
  popoverContent.includes('fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden'),
  'NotificationPopover should render a mobile backdrop overlay that hides on desktop (sm:hidden)'
);
console.log('✓ Mobile backdrop overlay detected');

// Test 2: Mobile Viewport Bounds & Centering
assert(
  popoverContent.includes('fixed inset-x-3.5 top-[68px] z-50 max-h-[calc(100vh-140px)] flex flex-col max-w-md mx-auto sm:mx-0'),
  'NotificationPopover container must use viewport-fixed bounds (inset-x-3.5 top-[68px]) with max-w-md mx-auto on mobile to eliminate right-skew and cut-off clipping'
);
console.log('✓ Mobile fixed viewport centering and margins verified');

// Test 3: Desktop anchored popover fallback
assert(
  popoverContent.includes('sm:absolute sm:top-full sm:bottom-auto sm:mt-2.5 sm:w-[420px] sm:max-w-[calc(100vw-24px)] sm:max-h-[580px]'),
  'NotificationPopover container must revert to anchored dropdown with sm:absolute and sm:top-full on desktop'
);
assert(
  popoverContent.includes("align === 'right' ? 'sm:right-0 sm:left-auto' : 'sm:left-0 sm:right-auto'"),
  'NotificationPopover must support directional alignment overriding mobile inset on desktop'
);
console.log('✓ Desktop anchored dropdown positioning verified');

// Test 4: Mobile drag handle indicator
assert(
  popoverContent.includes('w-8 h-1 rounded-full bg-line'),
  'NotificationPopover should include a sleek mobile drag indicator bar'
);
console.log('✓ Mobile visual handle indicator verified');

// Test 5: Scroll containment and flex list layout
assert(
  popoverContent.includes('flex-1 min-h-0 overflow-y-auto divide-y divide-line/40 scrollbar-thin sm:max-h-[400px] overscroll-contain'),
  'Notification items list must use flex-1 with overscroll-contain to prevent scroll bleeding on mobile'
);
console.log('✓ Scroll containment and flex height bounds verified');

// Test 6: Touch-friendly dismiss action
assert(
  popoverContent.includes('opacity-80 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation'),
  'Notification item dismiss button must be visible and touch-accessible on mobile without requiring mouse hover'
);
console.log('✓ Touch-friendly dismiss button verified');

// Test 7: Outside click guard for trigger button
assert(
  popoverContent.includes('[data-notification-trigger="true"]'),
  'NotificationPopover outside click listener must guard trigger button to prevent toggle fight'
);
console.log('✓ Trigger button toggle guard verified');

// Test 8: AppLayout z-index & data attributes
assert(
  layoutContent.includes('sticky top-0 z-40 shadow-xs'),
  'AppLayout header must have z-40 to elevate notifications popover above mobile bottom nav'
);
assert(
  (layoutContent.match(/data-notification-trigger="true"/g) || []).length >= 2,
  'AppLayout must label both mobile and desktop notification bell buttons with data-notification-trigger="true"'
);
console.log('✓ AppLayout header z-index and bell trigger attributes verified');

console.log('--- All Notification Layout Tests Passed Successfully ---');
