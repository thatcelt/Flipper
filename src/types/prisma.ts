import type { Author, Member, User } from 'karboai';

import type {
  ScheduleUncheckedUpdateOneWithoutUserNestedInput,
  ScheduleUpdateOneWithoutUserNestedInput,
  UserInclude,
} from '../../generated/prisma/models';
import type { DefaultArgs } from '@prisma/client/runtime/client';

export type UserBuilder = {
  user: User | Author | Member;
  update?: boolean;
  include?: UserInclude<DefaultArgs>;
};

export type UpdateCashBuilder = {
  id: string;
  increment: number;
  schedule?:
    ScheduleUncheckedUpdateOneWithoutUserNestedInput | ScheduleUpdateOneWithoutUserNestedInput;
};
