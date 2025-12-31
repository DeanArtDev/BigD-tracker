type RepoErrorKind = 'UNKNOWN' | 'NO_RESULT' | 'CONSTRAINT' | 'CONNECTION' | 'TIMEOUT';

function classify(): RepoErrorKind {
  return 'UNKNOWN';
}

export { classify };
