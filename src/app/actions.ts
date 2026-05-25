'use server';

import { supabase } from '@/lib/supabase';
import cards from '@/data/cards.json';

export interface CardProgress {
  interval: number;
  ease_factor: number;
  next_review: string;
}

export interface StudyProgress {
  [cardId: string]: CardProgress;
}

export async function getStudyProgress(): Promise<StudyProgress> {
  try {
    const { data, error } = await supabase.from('study_progress').select('*');
    if (error) throw error;
    
    const progress: StudyProgress = {};
    if (data) {
      data.forEach((row) => {
        progress[row.card_id] = {
          interval: row.interval,
          ease_factor: row.ease_factor,
          next_review: row.next_review,
        };
      });
    }
    return progress;
  } catch (error) {
    console.error('Error fetching study progress:', error);
    return {};
  }
}

export async function updateCardProgress(cardId: string, isCorrect: boolean) {
  const progress = await getStudyProgress();
  const card = cards.find((c) => c.id === cardId);

  if (!card) {
    console.error(`Card with ID ${cardId} not found.`);
    return;
  }

  let { interval, ease_factor, next_review } = progress[cardId] || {
    interval: 0,
    ease_factor: 2.5,
    next_review: new Date(0).toISOString(),
  };

  const now = new Date();

  if (isCorrect) {
    if (interval === 0) {
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

  try {
    const { error } = await supabase.from('study_progress').upsert({
      card_id: cardId,
      interval,
      ease_factor,
      next_review,
    });
    
    if (error) throw error;
    console.log(`Updated progress for card ${cardId}`);
  } catch (error) {
    console.error('Error updating study progress:', error);
  }
}
