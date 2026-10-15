import type { EventCellVM } from "@/data/views";
import { fmt } from "./format";
import styles from "./race-bar.module.css";

/**
 * A row's counting results stacked into one bar, scaled against the division's top total.
 * Display only: widths are each counted score's share of `scaleMax`; no scoring maths.
 */
export function RaceBar({ events, scaleMax }: { events: EventCellVM[]; scaleMax: number }) {
  const counted = events.filter((e) => e.status === "counted" && e.points !== null);
  return (
    <span className={styles.track} aria-hidden="true">
      {counted.map((e) => (
        <span
          key={e.short}
          className={styles.seg}
          style={{ width: `${((e.points ?? 0) / scaleMax) * 100}%` }}
          data-tip={`${e.short} · ${fmt(e.points ?? 0)}`}
        />
      ))}
    </span>
  );
}
