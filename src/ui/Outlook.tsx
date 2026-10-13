import type { Outlook as OutlookVM } from "@/domain/narrative";
import { fmt } from "./format";
import styles from "./outlook.module.css";

export function OutlookSection({ outlook, eventLabel }: { outlook: OutlookVM; eventLabel: string }) {
  return (
    <>
      {outlook.items.length > 0 && (
        <section aria-labelledby="outlook-heading" className={styles.section}>
          <h2 id="outlook-heading" className={styles.title}>
            Your {eventLabel} outlook
          </h2>
          <ul className={styles.items}>
            {outlook.items.map((item) => (
              <li key={item.kind}>{item.text}</li>
            ))}
          </ul>
        </section>
      )}

      {outlook.headToHead.length > 0 && (
        <section aria-labelledby="h2h-heading" className={styles.section}>
          <h2 id="h2h-heading" className={styles.title}>
            Head to head
          </h2>
          {outlook.headToHead.map((t) => (
            <table key={t.rivalId} className={styles.table}>
              <caption>
                <span className={styles.vs}>You vs</span> {t.rivalName}{" "}
                <span className={styles.rivalTotal}>on {fmt(t.rivalTotal)}</span>
              </caption>
              <thead>
                <tr>
                  <th scope="col">You finish</th>
                  <th scope="col" className={styles.num}>
                    Your total
                  </th>
                  <th scope="col">What you need from them</th>
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r) => (
                  <tr key={r.ownFinish} data-tone={r.tone}>
                    <th scope="row">{r.ownFinish}</th>
                    <td className={styles.num}>{fmt(r.ownTotal)}</td>
                    <td className={styles.verdict}>{r.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </section>
      )}

      <p className={styles.footnote}>
        These are mathematical possibilities, not forecasts. “If the surfers ahead add no points” is an assumption, not a
        prediction. Head-to-head rows never put you both in the same finishing place. Equal totals stay unresolved ties until
        the club confirms a tie-break. Points for 15th, 16th and below 17th aren’t confirmed, so those finishes aren’t named.
      </p>
    </>
  );
}
