type Row = Record<string, unknown>;

interface ExecuteResult {
  columns: string[];
  rows: unknown[][];
  rows_read: number;
  rows_written: number;
}

interface TursoResultWrapper {
  results: ExecuteResult;
}

export function createTursoFetchClient(url: string, authToken: string) {
  const httpUrl = url.replace('libsql://', 'https://');

  async function execute(sql: string, args: unknown[] = []): Promise<{ rows: Row[]; columns: string[] }> {
    const response = await fetch(httpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statements: [{ q: sql, params: args }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Turso query failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as TursoResultWrapper[];
    const result = data[0]?.results;

    if (!result) {
      return { rows: [], columns: [] };
    }

    const columns = result.columns || [];
    const rows = (result.rows || []).map((row: unknown[]) => {
      const obj: Row = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });

    return { rows, columns };
  }

  return { execute };
}
