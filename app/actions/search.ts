'use server';

import { redirect } from 'next/navigation';
import { validatePlayerQuery } from '@/lib/util/validate';

export async function searchPlayer(formData: FormData) {
  const raw = formData.get('username');
  if (typeof raw !== 'string') return;

  const query = validatePlayerQuery(raw);
  redirect(`/player/${encodeURIComponent(query)}`);
}
