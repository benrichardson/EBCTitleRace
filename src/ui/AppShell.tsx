import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./shell.module.css";

export function AppShell({
  snapshotLabel,
  water,
  children,
}: {
  snapshotLabel: string;
  /** Faded wave-pool water behind the header and top of the page. */
  water?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {water && <div className={styles.water} aria-hidden="true" />}
      <header className={styles.header} data-water={water || undefined}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.wordmark}>
            <span className={styles.logo} role="img" aria-label="EBC" />
            <span className={styles.title}>Race to the Title</span>
          </Link>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <img src="/brand/ebc-circle.png" alt="Elouera Boardriders Club, since 1980" className={styles.badge} width={96} height={96} />
        <div>
          <p>Snapshot {snapshotLabel} Sydney</p>
          <p>Provisional standings recalculated from LiveHeats results using club counting rules. Not an official result.</p>
        </div>
      </footer>
    </>
  );
}
