import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "arrivals.json");

async function readCount(): Promise<number> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw) as { count?: number };
    return typeof data.count === "number" && data.count >= 0 ? data.count : 0;
  } catch {
    return 0;
  }
}

let mutex = Promise.resolve<void>(undefined);

export function allocateNextRank(): Promise<number> {
  const result = mutex.then(async () => {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    const prev = await readCount();
    const rank = prev + 1;
    await fs.writeFile(DATA_PATH, JSON.stringify({ count: rank }), "utf-8");
    return rank;
  });

  mutex = result.then(() => undefined).catch(() => undefined);
  return result;
}
