import { createClient } from '@supabase/supabase-js';
import { it, expect, describe } from 'vitest';

import { StorageBuckets } from '@models';

import { getPublicUrl } from './storage.service';

const supabaseStorage = createClient(
  'https://test-project.supabase.co',
  'test-publishable-key',
  { auth: { autoRefreshToken: false, persistSession: false } }
).storage;

describe('getPublicUrl', () => {
  it.each([
    'user-1/1700000000000-icon.png',
    'user-1/1700000000000-my icon (1).png',
    '/user-1/leading-slash.png',
  ])('builds the same URL as the Supabase client for %s', (path) => {
    expect(getPublicUrl(StorageBuckets.HABIT_ICONS, path)).toBe(
      supabaseStorage.from(StorageBuckets.HABIT_ICONS).getPublicUrl(path).data
        .publicUrl
    );
  });

  it('falls back to the default icon', () => {
    expect(getPublicUrl(StorageBuckets.HABIT_ICONS, null)).toBe(
      'https://test-project.supabase.co/storage/v1/object/public/habit_icons/default.png'
    );
  });
});
