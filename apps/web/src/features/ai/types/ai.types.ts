export type AiFeedbackRating = 'helpful' | 'not_helpful';

export interface AiGenerationMeta {
  runId: string | null;
  providerLabel: string;
  modelLabel: string;
  promptVersion: string;
  generatedAtValue: string | null;
  generatedAtLabel: string;
  source: 'fresh' | 'cached';
  fallbackReason: string | null;
  feedbackRating: AiFeedbackRating | null;
}

