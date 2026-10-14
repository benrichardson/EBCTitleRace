import Link from "next/link";
import type { SurferPageVM } from "@/data/views";
import { AppShell } from "./AppShell";
import { fmt, ordinal } from "./format";
import { OutlookSection } from "./Outlook";
import { RaceChart } from "./RaceChart";
import { ResultsChart } from "./ResultsChart";
import styles from "./surfer.module.css";

export function SurferScreen({ page }: { page: SurferPageVM }) {
  const rivals = page.outlook.headToHead.map((t) => ({ id: t.rivalId, name: t.rivalName, total: t.rivalTotal }));
  return (
    <AppShell snapshotLabel={page.snapshotLabel}>
      <Link href={page.backHref} className={styles.back}>
        <span aria-hidden="true">←</span> Back to {page.divisionName} rankings
      </Link>

      <div className={styles.heroBlock}>
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
      </div>

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

      {rivals.length > 0 && (
        <section aria-labelledby="race-heading" className={styles.section}>
          <h2 id="race-heading" className={styles.sectionTitle}>
            The race
          </h2>
          <RaceChart you={{ name: page.name, total: page.total }} winTotal={page.winTotal} rivals={rivals} />
        </section>
      )}

      <OutlookSection outlook={page.outlook} eventLabel={page.pendingEvent?.label ?? "next event"} />

      <section aria-labelledby="results-heading" className={styles.section}>
        <h2 id="results-heading" className={styles.sectionTitle}>
          Results
        </h2>
        <ResultsChart events={page.events} />
        <p className={styles.legend}>
          Best {page.resultsToCount} count. Hatched columns with struck-through scores are discarded; “—” means no result.
        </p>
      </section>
    </AppShell>
  );
}
