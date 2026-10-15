"use client";

import Link from "next/link";
import { useState } from "react";
import type { RankingRowVM } from "@/data/views";
import { EventStrip } from "./EventStrip";
import { RaceBar } from "./RaceBar";
import { fmt, rankLabel } from "./format";
import styles from "./rankings.module.css";

export function RankingList({
  rows,
  divisionName,
  eventShortLabels,
  query,
  onClearQuery,
}: {
  rows: RankingRowVM[];
  divisionName: string;
  eventShortLabels: string[];
  /** Search text from the controls above; filters rows by name. */
  query: string;
  onClearQuery: () => void;
}) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Bars are scaled to the division's top total so they read as the race to the leader.
  const scaleMax = Math.max(1, ...rows.map((r) => r.total));
  const needle = query.trim().toLocaleLowerCase();
  const visible = needle ? rows.filter((r) => r.name.toLocaleLowerCase().includes(needle)) : rows;

  return (
    <section aria-label={`${divisionName} rankings`}>
      <p className="sr-only" aria-live="polite">
        {needle ? `${visible.length} of ${rows.length} surfers shown` : ""}
      </p>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <p>
            No one in {divisionName} matches “{query}”.
          </p>
          <button type="button" className={styles.textButton} onClick={onClearQuery}>
            Show everyone
          </button>
        </div>
      ) : (
        <>
          <div className={styles.columnHead} aria-hidden="true">
            <span>Rank</span>
            <span>Surfer</span>
            <span className={styles.headEvents}>
              {eventShortLabels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
            <span className={styles.headTotal}>Total</span>
          </div>
          <ol className={styles.list}>
            {visible.map((row) => {
              const isOpen = expanded.has(row.athleteId);
              const stripId = `results-${row.athleteId}`;
              return (
                <li key={row.athleteId} className={styles.row} data-open={isOpen || undefined}>
                  <span className={styles.rank} data-tied={row.tied || undefined}>
                    <span aria-hidden="true">{rankLabel(row.rank, row.tied)}</span>
                    <span className="sr-only">
                      Rank {row.rank}
                      {row.tied ? ", tied" : ""}
                    </span>
                  </span>
                  <Link href={row.href} className={styles.name}>
                    {row.name}
                  </Link>
                  <span className={styles.meta}>
                    {row.tied && <span className={styles.tieChip}>Tied</span>}
                    <span>
                      {row.gapToLeader === 0 ? (row.tied ? "Level with leader" : "Leader") : `${fmt(row.gapToLeader)} behind`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {row.replacement === null
                        ? `${row.resultsCounted} of ${row.resultsToCount} results`
                        : `replace ${fmt(row.replacement)}`}
                    </span>
                  </span>
                  {/* Sits above the row link so segment tooltips work; still opens the surfer page. */}
                  <Link href={row.href} className={styles.bar} tabIndex={-1} aria-hidden="true">
                    <RaceBar events={row.events} scaleMax={scaleMax} />
                  </Link>
                  <span className={styles.total}>
                    {fmt(row.total)}
                    <span className="sr-only"> points</span>
                  </span>
                  <button
                    type="button"
                    className={styles.toggle}
                    aria-expanded={isOpen}
                    aria-controls={stripId}
                    onClick={() => toggle(row.athleteId)}
                  >
                    <span className="sr-only">{isOpen ? "Hide" : "Show"} results for {row.name}</span>
                  </button>
                  <div className={styles.detail}>
                    <EventStrip events={row.events} id={stripId} hidden={!isOpen} inline />
                    {isOpen && (
                      <Link href={row.href} className={styles.outlookLink}>
                        Open {row.name}’s page <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
