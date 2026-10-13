import Link from "next/link";
import type { SurferPageVM } from "@/data/views";
import { AppShell } from "./AppShell";
import { EventStrip } from "./EventStrip";
import { fmt, ordinal } from "./format";
import { OutlookSection } from "./Outlook";
import styles from "./surfer.module.css";

export function SurferScreen({ page }: { page: SurferPageVM }) {
  return (
    <AppShell seriesName={page.seriesName} snapshotLabel={page.snapshotLabel}>
      <Link href={page.backHref} className={styles.back}>
        <span aria-hidden="true">←</span> Back to {page.divisionName} rankings
      </Link>

      <p className={styles.eyebrow}>
        {page.divisionName} · {page.seriesName}
      </p>
      <h1 className={styles.name}>{page.name}</h1>

      <dl className={styles.hero}>
        <div>
          <dt>Current rank</dt>
          <dd className={styles.big}>
            <span>
              {page.tied ? "=" : ""}
              {ordinal(page.rank)}
            </span>
            {page.tied && <span className={styles.tieChip}>Tied</span>}
          </dd>
        </div>
        <div>
          <dt>Total (best {page.resultsToCount})</dt>
          <dd className={styles.big}>{fmt(page.total)}</dd>
        </div>
      </dl>

      <dl className={styles.stats}>
        <div>
          <dt>Score to replace</dt>
          <dd>
            {page.replacement === null ? (
              <span className={styles.statNote}>
                None yet · {page.resultsCounted} of {page.resultsToCount} results
              </span>
            ) : (
              fmt(page.replacement)
            )}
          </dd>
        </div>
        <div>
          <dt>Total with a win</dt>
          <dd>{fmt(page.winTotal)}</dd>
        </div>
      </dl>

      <p className={styles.headline}>{page.outlook.headline}</p>

      <OutlookSection outlook={page.outlook} eventLabel={page.pendingEvent?.label ?? "next event"} />

      <section aria-labelledby="results-heading" className={styles.section}>
        <h2 id="results-heading" className={styles.sectionTitle}>
          Results
        </h2>
        <EventStrip events={page.events} />
        <p className={styles.legend}>
          Best {page.resultsToCount} count. Struck-through scores are discarded; “—” means no result.
        </p>
      </section>
    </AppShell>
  );
}
