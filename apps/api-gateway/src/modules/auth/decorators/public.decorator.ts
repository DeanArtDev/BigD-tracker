import { SetMetadata } from '@nestjs/common';

const IS_PUBLIC_KEY = 'isPublic';
const Public = (value: boolean = true) => SetMetadata(IS_PUBLIC_KEY, value);

export { IS_PUBLIC_KEY, Public };
