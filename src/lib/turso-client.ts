const getConfig = () => ({
  url: process.env.TURSO_CONNECTION_URL!.replace('libsql://', 'https://'),
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

function formatArg(arg: any): { type: string; value: any } {
  if (arg === null || arg === undefined) return { type: 'null', value: null };
  if (typeof arg === 'number') {
    if (Number.isInteger(arg)) return { type: 'integer', value: String(arg) };
    return { type: 'float', value: arg };
  }
  if (typeof arg === 'boolean') return { type: 'integer', value: arg ? '1' : '0' };
  if (typeof arg === 'string') return { type: 'text', value: arg };
  if (arg instanceof Date) return { type: 'integer', value: String(arg.getTime()) };
  return { type: 'text', value: String(arg) };
}

export async function tursoExecute(
  sql: string, 
  args: any[] = []
): Promise<{ columns: string[]; rows: Record<string, any>[] }> {
  const { url, authToken } = getConfig();
  
  const response = await fetch(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(formatArg) } },
        { type: 'close' },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Turso HTTP error: ${response.status} ${text}`);
  }

  const data = await response.json() as any;
  
  if (data.results?.[0]?.type === 'error') {
    throw new Error(`Turso query error: ${data.results[0].error.message}`);
  }

  const result = data.results?.[0]?.response?.result;
  if (!result) {
    return { columns: [], rows: [] };
  }

  const columns: string[] = result.cols?.map((c: any) => c.name) || [];
  const rows = (result.rows || []).map((row: any[]) => {
    const obj: Record<string, any> = {};
    columns.forEach((col, i) => {
      obj[col] = row[i]?.value ?? null;
    });
    return obj;
  });

  return { columns, rows };
}

export async function tursoExecuteMany(
  statements: Array<{ sql: string; args?: any[] }>
): Promise<Array<{ columns: string[]; rows: Record<string, any>[] }>> {
  const { url, authToken } = getConfig();
  
  const requests = statements.map(stmt => ({
    type: 'execute',
    stmt: { sql: stmt.sql, args: (stmt.args || []).map(formatArg) },
  }));
  requests.push({ type: 'close' } as any);

  const response = await fetch(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Turso HTTP error: ${response.status} ${text}`);
  }

  const data = await response.json() as any;
  
  return data.results
    .filter((r: any) => r.type === 'ok')
    .map((r: any) => {
      const result = r.response?.result;
      if (!result) return { columns: [], rows: [] };
      
      const columns: string[] = result.cols?.map((c: any) => c.name) || [];
      const rows = (result.rows || []).map((row: any[]) => {
        const obj: Record<string, any> = {};
        columns.forEach((col, i) => {
          obj[col] = row[i]?.value ?? null;
        });
        return obj;
      });
      
      return { columns, rows };
    });
}
