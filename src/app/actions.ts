import { kv } from '@/lib/kv';
import cards from '@/data/cards.json';

export interface CardProgress {
  interval: number;
  ease_factor: number;
  next_review: string;
}

export interface StudyProgress {
  [cardId: string]: CardProgress;
}

const KV_KEY = 'calculus_study_progress';

export async function getStudyProgress(): Promise<StudyProgress> {
  try {
    const progress = await kv.get<StudyProgress>(KV_KEY);
    return progress || {};
  } catch (error) {
    console.error('Error fetching study progress:', error);
    return {};
  }
}

export async function updateCardProgress(cardId: string, isCorrect: boolean) {
  const progress = await getStudyProgress();
  const card = cards.find(c => c.id === cardId);

  if (!card) {
    console.error(`Card with ID ${cardId} not found.`);
    return;
  }

  let { interval, ease_factor, next_review } = progress[cardId] || {
    interval: 0,
    ease_factor: 2.5,
    next_review: new Date(0).toISOString(), // Epoch for new cards
  };

  const now = new Date();

  if (isCorrect) {
    if (interval === 0) { // New card or first correct answer
      interval = 1;
    } else {
      interval = Math.ceil(interval * ease_factor);
    }
  } else {
    interval = 1;
    ease_factor = Math.max(ease_factor - 0.2, 1.3);
  }

  const nextReviewDate = new Date(now.setDate(now.getDate() + interval));
  next_review = nextReviewDate.toISOString();

  progress[cardId] = { interval, ease_factor, next_review };

  try {
    await kv.set(KV_KEY, progress);
    console.log(`Updated progress for card ${cardId}:`, progress[cardId]);
  } catch (error) {
    console.error('Error updating study progress:', error);
  }
}
