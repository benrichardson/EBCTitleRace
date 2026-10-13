import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./shell.module.css";

export function AppShell({
  seriesName,
  snapshotLabel,
  children,
}: {
  seriesName: string;
  snapshotLabel: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.wordmark}>
            EBC Title Race
          </Link>
          <span className={styles.series}>{seriesName}</span>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>Snapshot {snapshotLabel} Sydney</p>
        <p>Provisional standings recalculated from LiveHeats results using club counting rules. Not an official result.</p>
      </footer>
    </>
  );
}
