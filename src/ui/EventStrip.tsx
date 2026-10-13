import type { EventCellVM } from "@/data/views";
import { fmt } from "./format";
import styles from "./event-strip.module.css";

export function EventStrip({
  events,
  id,
  hidden,
  inline,
}: {
  events: EventCellVM[];
  id?: string;
  hidden?: boolean;
  /** Inside a desktop rankings row: always shown, months come from the column header. */
  inline?: boolean;
}) {
  return (
    <ol className={styles.strip} id={id} hidden={hidden} data-inline={inline || undefined}>
      {events.map((e) => (
        <li key={e.short} className={styles.cell} data-status={e.status}>
          <span className={styles.month} aria-hidden="true">
            {e.short}
          </span>
          <span className={styles.value} aria-hidden="true">
            {e.status === "pending" ? "Pending" : e.points === null ? "—" : e.status === "discarded" ? <s>{fmt(e.points)}</s> : fmt(e.points)}
          </span>
          <span className="sr-only">{e.srText}</span>
        </li>
      ))}
    </ol>
  );
}
