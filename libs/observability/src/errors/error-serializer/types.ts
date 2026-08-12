interface SerializeErrorOptions {
  /** Maximum number of serialized nodes in the `cause` chain. Defaults to 8. */
  readonly maxDepth?: number;
}

interface SerializationContext {
  readonly maxDepth: number;
  readonly errorPath: WeakSet<object>;
}

export { type SerializationContext, type SerializeErrorOptions };
