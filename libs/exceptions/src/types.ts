/**
 * @see ValidationError in class-validator, it based on it
 * */
interface ValidationIssue {
  readonly target?: object;
  readonly property: string;
  readonly value?: any;
  readonly constraints?: {
    [type: string]: string;
  };
  readonly children?: ValidationIssue[];
  readonly contexts?: {
    [type: string]: any;
  };
}

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type ExtractCodes<T> = T extends { readonly code: infer C }
  ? IfAny<C, never, C extends string ? C : never>
  : T extends readonly (infer U)[]
    ? ExtractCodes<U>
    : T extends object
      ? { [K in keyof T]: ExtractCodes<T[K]> }[keyof T]
      : never;

export { ValidationIssue, ExtractCodes };
