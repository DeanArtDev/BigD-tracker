import { AuthDB } from '@/modules/auth/application/ports';
import { specificationCombinatorFactory, SpecificationObject } from '@big-d/api-utils';

type AuthSpecification = SpecificationObject<AuthDB>;

const usersCombinators = specificationCombinatorFactory<AuthDB>('users');
const sessionsCombinators = specificationCombinatorFactory<AuthDB>('sessions');

export { sessionsCombinators, usersCombinators, AuthSpecification };
