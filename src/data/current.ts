import seasonJson from "../../data/season-2026.json";
import snapshotJson from "../../data/snapshot.json";
import { loadSeasonConfig } from "./season";
import { normaliseSnapshot } from "./snapshot";

// The active season and the latest snapshot (written by `pnpm refresh`), validated once
// at build time. A snapshot that fails validation fails the build.
export const season = loadSeasonConfig(seasonJson);
export const snapshot = normaliseSnapshot(snapshotJson, season);
