#!/bin/bash
set -e

export PGUSER="$POSTGRES_USER"
export PGDATABASE="$POSTGRES_DB"

# Goal tracker service
psql <<EOSQL
  CREATE ROLE goal_tracker_service
    WITH LOGIN
    PASSWORD '${GOAL_TRACKER_USER_DB_PASSWORD}';

  GRANT CONNECT, CREATE, TEMPORARY ON DATABASE goal_tracker TO goal_tracker_service;

  \connect goal_tracker

  GRANT USAGE, CREATE ON SCHEMA public TO goal_tracker_service;

  -- existing tables
  GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA public
    TO goal_tracker_service;

  -- existing sequences (важно для nextval/currval и т.п.)
  GRANT USAGE, SELECT, UPDATE
    ON ALL SEQUENCES IN SCHEMA public
    TO goal_tracker_service;

  -- default privileges for FUTURE tables
  ALTER DEFAULT PRIVILEGES
  FOR ROLE goal_tracker_service
  IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLES
  TO goal_tracker_service;

  -- default privileges for FUTURE sequences
  ALTER DEFAULT PRIVILEGES
  FOR ROLE goal_tracker_service
  IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE
  ON SEQUENCES
  TO goal_tracker_service;

  -- default privileges for FUTURE functions
  ALTER DEFAULT PRIVILEGES
  FOR ROLE goal_tracker_service
  IN SCHEMA public
  GRANT EXECUTE
  ON FUNCTIONS
  TO goal_tracker_service;
EOSQL