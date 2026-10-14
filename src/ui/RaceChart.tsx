import { fmt } from "./format";
import styles from "./race-chart.module.css";

interface Lane {
  id: string;
  name: string;
  total: number;
  isYou?: boolean;
}

/**
 * Dot plot of the surfer against their closest rivals, on an axis zoomed to the contest.
 * Display only: positions are scaled from totals the view model already provides.
 */
export function RaceChart({
  you,
  winTotal,
  rivals,
}: {
  you: { name: string; total: number };
  winTotal: number;
  rivals: { id: string; name: string; total: number }[];
}) {
  const lanes: Lane[] = [{ id: "you", name: you.name, total: you.total, isYou: true }, ...rivals].sort(
    (a, b) => b.total - a.total,
  );
  const values = [...lanes.map((l) => l.total), winTotal];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = Math.max(50, (hi - lo) * 0.15);
  const min = lo - pad;
  const span = hi + pad - min;
  const x = (v: number) => `${((v - min) / span) * 100}%`;

  return (
    <figure className={styles.figure}>
      <ul className={styles.lanes}>
        {lanes.map((l) => (
          <li key={l.id} className={styles.lane} data-you={l.isYou || undefined}>
            <span className={styles.label}>{l.isYou ? "You" : l.name}</span>
            <span className={styles.track} aria-hidden="true">
              {l.isYou && winTotal > l.total && (
                <span className={styles.reach} style={{ left: x(l.total), width: `calc(${x(winTotal)} - ${x(l.total)})` }}>
                  <span className={styles.reachLabel}>Win → {fmt(winTotal)}</span>
                </span>
              )}
              <span className={styles.dot} style={{ left: x(l.total) }}>
                <span className={styles.value}>{fmt(l.total)}</span>
              </span>
            </span>
            <span className="sr-only">
              {l.isYou ? `You: ${fmt(l.total)} now, ${fmt(winTotal)} with a win` : `${l.name}: ${fmt(l.total)}`}
            </span>
          </li>
        ))}
      </ul>
      <figcaption className={styles.caption}>
        Current totals. The yellow bar shows how far a win would take you if they add no points.
      </figcaption>
    </figure>
  );
}
