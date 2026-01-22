import { SpecificationObject, TDB } from './types';

interface Opts {
  readonly includeMeta?: boolean;
  readonly multiline?: boolean;
  readonly indent?: number;
  readonly maxDepth?: number;
}

export function specToDebugString<TTable extends TDB>(
  spec: SpecificationObject<TTable>,
  opts: Opts = {},
): string {
  const includeMeta = opts.includeMeta ?? false;
  const multiline = opts.multiline ?? true;
  const indentSize = opts.indent ?? 2;
  const maxDepth = opts.maxDepth ?? 10;

  const pad = (n: number) => (multiline ? ' '.repeat(n) : '');
  const nl = multiline ? '\n' : '';
  const joinSep = multiline ? `,${nl}` : ', ';

  const isDefaultCompositeKey = (s: SpecificationObject<TTable>): boolean => {
    const base = String(s.tableName);
    return (
      (s.kind === 'and' && s.key === `${base}.and`) ||
      (s.kind === 'or' && s.key === `${base}.or`) ||
      (s.kind === 'not' && s.key === `${base}.not`)
    );
  };

  const formatMeta = (s: SpecificationObject<TTable>): string => {
    if (!includeMeta || !s.meta) return '';
    try {
      return ` ${JSON.stringify(s.meta)}`;
    } catch {
      return ' {meta:unserializable}';
    }
  };

  const kindLabel = (k: SpecificationObject<TTable>['kind']): string => {
    switch (k) {
      case 'and':
        return 'AND';
      case 'or':
        return 'OR';
      case 'not':
        return 'NOT';
      case 'leaf':
        return 'LEAF';
      default:
        return String(k).toUpperCase();
    }
  };

  const formatCompositeHeader = (s: SpecificationObject<TTable>): string => {
    const label = kindLabel(s.kind);
    const keyPart = isDefaultCompositeKey(s) ? '' : `[${s.key}]`;
    return `${label}${keyPart}`;
  };

  const walk = (s: SpecificationObject<TTable>, depth: number, currentIndent: number): string => {
    if (depth > maxDepth) {
      const head = s.kind === 'leaf' ? s.key : `${formatCompositeHeader(s)}(...)`;
      return `${head}…`;
    }

    if (s.kind === 'leaf' || !s.children || s.children.length === 0) {
      return `${s.key}${formatMeta(s)}`;
    }

    // NOT должен иметь 1 ребёнка
    if (s.kind === 'not') {
      const child = s.children[0];
      const head = `${formatCompositeHeader(s)}(`;
      const inner = child ? walk(child, depth + 1, currentIndent + indentSize) : '';
      const closeIndent = pad(currentIndent);
      const innerIndent = pad(currentIndent + indentSize);

      if (!multiline) {
        return `${head}${inner})${formatMeta(s)}`;
      }

      return `${head}${nl}` + `${innerIndent}${inner}${nl}` + `${closeIndent})${formatMeta(s)}`;
    }

    // AND/OR: список детей
    const head = `${formatCompositeHeader(s)}(`;
    const closeIndent = pad(currentIndent);
    const childIndent = pad(currentIndent + indentSize);

    const children = s.children.map((c) => walk(c, depth + 1, currentIndent + indentSize));

    if (!multiline) {
      return `${head}${children.join(', ')})${formatMeta(s)}`;
    }

    return (
      `${head}${nl}` +
      `${children.map((x) => `${childIndent}${x}`).join(joinSep)}${nl}` +
      `${closeIndent})${formatMeta(s)}`
    );
  };

  return walk(spec, 0, 0);
}
