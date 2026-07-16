import type { Author, Member, User } from 'karboai';

import type {
  ScheduleUncheckedUpdateOneWithoutUserNestedInput,
  ScheduleUpdateOneWithoutUserNestedInput,
  UserInclude,
} from '../../generated/prisma/models';
import type { DefaultArgs } from '@prisma/client/runtime/client';
import type { Card, Stats } from '../../generated/prisma/client';

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

export type RobQueriesBuilder = {
  userId: string;
  targetId: string;
  result: boolean;
  maxCash: number;
};

export type TopUser = {
  id: string;
  stats: Stats;
  card: Card;
};
