import sql from 'mssql';
import type { BackfillData, DbRosterRow, DbSession, DbUser } from './model';

/**
 * READ-ONLY. The tool may only ever issue single SELECT statements; every write is emitted as a SQL
 * file for a human to review and run (D9). This guard rejects anything else before it reaches the server.
 */
const select = async <T>(pool: sql.ConnectionPool, query: string): Promise<T[]> => {
  if (!/^\s*SELECT\s/i.test(query) || query.includes(';')) {
    throw new Error(`Refusing to run a non-SELECT statement: ${query}`);
  }
  const result = await pool.request().query<T>(query);
  return result.recordset;
};

export const loadBackfillData = async (): Promise<BackfillData> => {
  const connectionString = process.env.HOCKEYPICKUP_DB;
  if (!connectionString) {
    throw new Error('Set HOCKEYPICKUP_DB to a SQL Server connection string (read access is all the tool needs).');
  }

  const pool = await new sql.ConnectionPool(connectionString).connect();
  try {
    // Every session, cancelled ones included
    const sessions = await select<DbSession>(
      pool,
      'SELECT SessionId, SessionDate, CreateDateTime, Note FROM Sessions ORDER BY SessionDate',
    );
    // Every user, active and inactive
    const users = await select<DbUser>(
      pool,
      'SELECT Id, FirstName, LastName, Email, PositionPreference, Active FROM AspNetUsers',
    );
    const rosters = await select<DbRosterRow>(
      pool,
      'SELECT SessionId, UserId, Position, TeamAssignment, IsPlaying FROM SessionRosters',
    );
    return { sessions, users, rosters };
  } finally {
    await pool.close();
  }
};
