/** One finalised, eligible event result for an athlete. */
export interface EventResult {
  resultId: string;
  eventId: string;
  /** Chronological position of the event within the season (lower = earlier). */
  eventOrder: number;
  place: number;
  points: number;
}

/** An athlete's best-N standing. */
export interface Standing {
  total: number;
  counted: EventResult[];
  discarded: EventResult[];
  /** Lowest counted score once N results exist; otherwise 0. */
  replacement: number;
}
