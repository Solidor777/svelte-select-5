import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// @testing-library/svelte auto-cleans only when a global afterEach exists.
// We don't enable Vitest globals, so register cleanup explicitly.
afterEach(() => cleanup());
