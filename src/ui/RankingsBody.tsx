"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { RankingsPageVM } from "@/data/views";
import { RankingList } from "./RankingList";
import { fmt, rankLabel } from "./format";
import styles from "./rankings.module.css";

/** Division picker, surfer search, title, podium and list. Owns the search state. */
export function RankingsBody({ page, intro }: { page: RankingsPageVM; intro: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const selectId = useId();
  const searchId = useId();

  // Restore a search from the URL (e.g. after Back from a surfer page).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  function updateQuery(q: string) {
    setQuery(q);
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    window.history.replaceState(window.history.state, "", url);
  }

  const name = page.division.name;
  const eventShortLabels = page.rows[0]?.events.map((e) => e.short) ?? [];
  const podium = query.trim() ? [] : page.rows.slice(0, 3);

  return (
    <>
      <div className={styles.hero}>
        <p className={styles.heroIntro}>{intro}</p>
        <div className={styles.controls}>
          <div className={styles.field}>
            <label htmlFor={selectId} className={styles.fieldLabel}>
              Division
            </label>
            <select
              id={selectId}
              className={styles.select}
              value={page.divisions.find((d) => d.isActive)?.href}
              onChange={(e) => router.push(e.target.value)}
            >
              {page.divisions.map((d) => (
                <option key={d.id} value={d.href}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={searchId} className={styles.fieldLabel}>
              Find a surfer
            </label>
            <input
              id={searchId}
              type="search"
              className={styles.search}
              placeholder={`Search ${name}`}
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </div>


      <div className={styles.titleRow}>
        <h1 className={styles.title}>{name}</h1>
        {page.pendingEvent && (
          <div className={styles.banner}>
            <p className={styles.bannerHead}>One event to go</p>
            <p className={styles.bannerBody}>
              {page.pendingEvent.label}
              <br />
              Best {page.division.resultsToCount} results count
            </p>
          </div>
        )}
      </div>

      {podium.length > 0 && (
        <section aria-label="Top three" className={styles.podium}>
          {podium.map((row, i) => (
            <Link key={row.athleteId} href={row.href} className={styles.podiumCard} data-place={i + 1}>
              <span className={styles.podiumRank}>
                <span aria-hidden="true">{rankLabel(row.rank, row.tied)}</span>
                <span className="sr-only">
                  Rank {row.rank}
                  {row.tied ? ", tied" : ""}
                </span>
              </span>
              <span className={styles.podiumName}>{row.name}</span>
              <span className={styles.podiumTotal}>
                {fmt(row.total)} <span className={styles.podiumUnit}>pts</span>
              </span>
              <span className={styles.podiumGap}>
                {row.gapToLeader === 0 ? (row.tied ? "Level with leader" : "Leader") : `${fmt(row.gapToLeader)} behind`}
              </span>
            </Link>
          ))}
        </section>
      )}

      <p className={styles.snapshot}>Snapshot {page.snapshotLabel} Sydney</p>
      <RankingList
        rows={page.rows}
        divisionName={name}
        eventShortLabels={eventShortLabels}
        query={query}
        onClearQuery={() => updateQuery("")}
      />
    </>
  );
}
