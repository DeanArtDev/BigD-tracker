function getCorrelationId(message: Record<string, any>): string | undefined {
  return message.properties?.headers?.['x-correlation-id'];
}

export { getCorrelationId };
