// src/app/[locale]/homepage/TickerServer.tsx
// Pure server component — no JS sent to client
import styles from "./homepage.module.css";

export default function TickerServer({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  // Duplicate for seamless loop — CSS animation only, no JS
  const doubled = [...items, ...items];

  return (
    <div className={styles.ticker} aria-hidden="true" role="marquee">
      <div className={styles.tickerTrack}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.tickerItem}>
            <span className={styles.tickerSep} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}