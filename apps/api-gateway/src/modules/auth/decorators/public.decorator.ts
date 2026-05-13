import { SetMetadata } from '@nestjs/common';

const IS_PUBLIC_KEY = Symbol.for('is_public');
const Public = (value: boolean = true) => SetMetadata(IS_PUBLIC_KEY, value);

export { IS_PUBLIC_KEY, Public };
