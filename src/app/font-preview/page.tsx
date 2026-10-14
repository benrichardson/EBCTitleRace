// TEMPORARY design preview: compare handwritten masthead fonts. Not for shipping.
import {
  Caveat_Brush,
  Covered_By_Your_Grace,
  Gochi_Hand,
  Knewave,
  Nanum_Brush_Script,
  Permanent_Marker,
  Rock_Salt,
  Sedgwick_Ave_Display,
} from "next/font/google";
import type { CSSProperties } from "react";
import styles from "./preview.module.css";

const marker = Permanent_Marker({ subsets: ["latin"], weight: "400" });
const knewave = Knewave({ subsets: ["latin"], weight: "400" });
const caveat = Caveat_Brush({ subsets: ["latin"], weight: "400" });
const rockSalt = Rock_Salt({ subsets: ["latin"], weight: "400" });
const sedgwick = Sedgwick_Ave_Display({ subsets: ["latin"], weight: "400" });
const covered = Covered_By_Your_Grace({ subsets: ["latin"], weight: "400" });
const gochi = Gochi_Hand({ subsets: ["latin"], weight: "400" });
const nanum = Nanum_Brush_Script({ subsets: ["latin"], weight: "400" });

const options = [
  { n: "0", name: "Current: Bungee + 3D + slant", family: "var(--font-wordmark)", size: 0.62, current: true },
  { n: "1", name: "Permanent Marker · thick felt-tip", family: marker.style.fontFamily, size: 0.9 },
  { n: "2", name: "Knewave · bold brush, surfy", family: knewave.style.fontFamily, size: 0.9 },
  { n: "3", name: "Caveat Brush · quick brush pen", family: caveat.style.fontFamily, size: 1.1 },
  { n: "4", name: "Rock Salt · scratchy, raw", family: rockSalt.style.fontFamily, size: 0.66 },
  { n: "5", name: "Sedgwick Ave Display · graffiti tag", family: sedgwick.style.fontFamily, size: 1.1 },
  { n: "6", name: "Covered By Your Grace · loose marker", family: covered.style.fontFamily, size: 1.15 },
  { n: "7", name: "Gochi Hand · friendly, wonky", family: gochi.style.fontFamily, size: 1 },
  { n: "8", name: "Nanum Brush Script · dry brush", family: nanum.style.fontFamily, size: 1.35 },
];

export default function FontPreview() {
  return (
    <main className={styles.page}>
      <div className={styles.water} aria-hidden="true" />
      <h1 className={styles.heading}>Handwritten masthead options</h1>
      {options.map((o) => (
        <section key={o.n} className={styles.option}>
          <p className={styles.label}>
            <strong>{o.n}.</strong> {o.name}
          </p>
          <div className={styles.lockup}>
            <span className={styles.logo} role="img" aria-label="EBC" />
            <span
              className={styles.title}
              data-current={o.current || undefined}
              data-text="Race to the Title"
              style={{ "--family": o.family, "--size": o.size } as CSSProperties}
            >
              Race to the Title
            </span>
          </div>
        </section>
      ))}
    </main>
  );
}
