let localDbInstance = null;

async function getLocalDb() {
  if (localDbInstance) return localDbInstance;

  // Dynamically import node modules so Cloudflare Workers/Pages edge bundler ignores them
  const { DatabaseSync } = await import('node:sqlite');
  const path = (await import('node:path')).default;
  const fs = (await import('node:fs')).default;
  const { fileURLToPath } = await import('node:url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'soopi.db');
  const db = new DatabaseSync(dbPath);

  // Initialize tables if not already created
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
  }

  localDbInstance = db;
  return localDbInstance;
}

/**
 * Unified database adapter supporting both Cloudflare D1 and Node.js DatabaseSync.
 * Methods:
 *  - all(sql, params) -> Array of objects
 *  - get(sql, params) -> Single object or null
 *  - run(sql, params) -> { changes, lastInsertRowid }
 *  - exec(sql)
 */
export function createDbAdapter(env) {
  // 1. If running inside Cloudflare Pages / Worker with D1 binding
  if (env && env.DB) {
    const d1 = env.DB;
    return {
      type: 'd1',
      async all(sql, params = []) {
        const stmt = d1.prepare(sql).bind(...params);
        const res = await stmt.all();
        return res.results || [];
      },
      async get(sql, params = []) {
        const stmt = d1.prepare(sql).bind(...params);
        const res = await stmt.first();
        return res || null;
      },
      async run(sql, params = []) {
        const stmt = d1.prepare(sql).bind(...params);
        const res = await stmt.run();
        return {
          changes: res.meta?.changes ?? 0,
          lastInsertRowid: res.meta?.last_row_id ?? null,
        };
      },
      async exec(sql) {
        return await d1.exec(sql);
      }
    };
  }

  // 2. Node.js DatabaseSync mode for local development
  return {
    type: 'sqlite',
    async all(sql, params = []) {
      const localDb = await getLocalDb();
      const stmt = localDb.prepare(sql);
      return stmt.all(...params);
    },
    async get(sql, params = []) {
      const localDb = await getLocalDb();
      const stmt = localDb.prepare(sql);
      const row = stmt.get(...params);
      return row || null;
    },
    async run(sql, params = []) {
      const localDb = await getLocalDb();
      const stmt = localDb.prepare(sql);
      const res = stmt.run(...params);
      return {
        changes: res.changes,
        lastInsertRowid: Number(res.lastInsertRowid)
      };
    },
    async exec(sql) {
      const localDb = await getLocalDb();
      localDb.exec(sql);
      return true;
    }
  };
}
