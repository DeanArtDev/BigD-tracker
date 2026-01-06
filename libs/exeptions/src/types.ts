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

export { ValidationIssue };
