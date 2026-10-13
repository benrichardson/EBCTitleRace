import type { RankingsPageVM } from "@/data/views";
import { AppShell } from "./AppShell";
import { DivisionRail } from "./DivisionRail";
import { RankingList } from "./RankingList";
import styles from "./rankings.module.css";

export function RankingsScreen({ page }: { page: RankingsPageVM }) {
  const eventShortLabels = page.rows[0]?.events.map((e) => e.short) ?? [];
  return (
    <AppShell seriesName={page.seriesName} snapshotLabel={page.snapshotLabel}>
      <DivisionRail divisions={page.divisions} />
      <h1 className={styles.title}>{page.division.name}</h1>
      {page.pendingEvent && (
        <div className={styles.banner}>
          <p className={styles.bannerHead}>One event to go</p>
          <p className={styles.bannerBody}>
            {page.pendingEvent.label} · Best {page.division.resultsToCount} results count
          </p>
        </div>
      )}
      <p className={styles.snapshot}>Snapshot {page.snapshotLabel} Sydney</p>
      <RankingList rows={page.rows} divisionName={page.division.name} eventShortLabels={eventShortLabels} />
    </AppShell>
  );
}
