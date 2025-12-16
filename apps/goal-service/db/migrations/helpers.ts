import { Kysely, sql } from 'kysely';

async function setUpdateTriggerOnUpdatedAt(tableName: string, db: Kysely<any>) {
  const triggerName = `trg_${tableName}_updated_at`;

  await sql
    .raw(
      `
        CREATE TRIGGER "${triggerName}"
        BEFORE UPDATE
        ON "${tableName}"
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
      `,
    )
    .execute(db);
}

async function createUpdatedAtFieldTriggerFn(db: Kysely<any>) {
  await sql`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at := now();
      RETURN NEW;
    END;
    $$;
  `.execute(db);
}

async function dropUpdatedAtFieldTriggerFn(db: Kysely<any>) {
  await sql`
    DROP FUNCTION IF EXISTS set_updated_at();
  `.execute(db);
}

export { setUpdateTriggerOnUpdatedAt, createUpdatedAtFieldTriggerFn, dropUpdatedAtFieldTriggerFn };
