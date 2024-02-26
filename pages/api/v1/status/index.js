import database from "infra/database.js";

async function status(request, response) {
  const dbVersionResult = await database.query("SHOW server_version;");
  const dbVersion = dbVersionResult.rows[0].server_version;

  const dbMaxConnectionsResult = await database.query("SHOW max_connections;");
  const dbMaxConnections = dbMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const dbOpenedConnectionsResult = await database.query({
    text: `SELECT
      count(*)::int
    FROM
      pg_stat_activity
    WHERE
      datname = $1;`,
    values: [databaseName],
  });
  const dbOpenedConnections = dbOpenedConnectionsResult.rows[0].count;

  const updatedAt = new Date().toISOString();
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: dbVersion,
        max_connections: parseInt(dbMaxConnections),
        opened_connections: dbOpenedConnections,
      },
    },
  });
}

export default status;
