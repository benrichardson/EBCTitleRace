import seasonJson from "../../data/season-2026.json";
import snapshotJson from "../../data/prototype-snapshot.json";
import { loadSeasonConfig } from "./season";
import { normaliseSnapshot } from "./snapshot";

// The active season and snapshot, validated once at build time. Swap the snapshot import
// when the refresh command lands.
export const season = loadSeasonConfig(seasonJson);
export const snapshot = normaliseSnapshot(snapshotJson, season);
