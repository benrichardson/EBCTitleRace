import type { EventCellVM } from "@/data/views";
import { fmt } from "./format";
import styles from "./results-chart.module.css";

/** Season results as columns. Heights are each score's share of the best score shown; display only. */
export function ResultsChart({ events }: { events: EventCellVM[] }) {
  const max = Math.max(1, ...events.map((e) => e.points ?? 0));
  return (
    <ol className={styles.chart}>
      {events.map((e) => (
        <li key={e.short} className={styles.col} data-status={e.status}>
          <span className={styles.plot} aria-hidden="true">
            <span className={styles.value}>
              {e.status === "pending" ? "?" : e.points === null ? "—" : e.status === "discarded" ? <s>{fmt(e.points)}</s> : fmt(e.points)}
            </span>
            <span
              className={styles.bar}
              // 85% leaves headroom for the value label above the tallest column.
              style={{ height: e.status === "pending" ? "85%" : `${((e.points ?? 0) / max) * 85}%` }}
            />
          </span>
          <span className={styles.month} aria-hidden="true">
            {e.short}
          </span>
          <span className="sr-only">{e.srText}</span>
        </li>
      ))}
    </ol>
  );
}
