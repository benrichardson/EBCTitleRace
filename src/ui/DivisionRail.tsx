"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { DivisionLinkVM } from "@/data/views";
import styles from "./rankings.module.css";

export function DivisionRail({ divisions }: { divisions: DivisionLinkVM[] }) {
  const active = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    active.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, []);

  return (
    <nav aria-label="Divisions" className={styles.railWrap}>
      <ul className={styles.rail}>
        {divisions.map((d) => (
          <li key={d.id}>
            <Link
              href={d.href}
              ref={d.isActive ? active : undefined}
              aria-current={d.isActive ? "page" : undefined}
              className={styles.chip}
            >
              {d.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
