import { bold, code, italic } from 'karboai';

import { main, sub } from '../public/data/commands.json';
import { works } from '../public/data/works.json';
import * as shops from '../public/data/shops.json';
import {
  SubCommand,
  SubCommandsRecord,
  WorksRecord,
} from './schemas/interactive';

export const ALL_COMMANDS = main
  .map((command) => `${bold(command.name)} - ${italic(command.description)}\n`)
  .join('\n');

export const WORKS_RECORD = works.reduce((accumulator, currentItem) => {
  accumulator[currentItem.workId] = currentItem.metadata;
  return accumulator;
}, {} as WorksRecord);

export const WORKS_STRING = `${bold('Доступные работы:')}\n\n${works
  .map(
    (work) =>
      `${italic(bold(work.metadata.name))} [ID: ${code(work.workId.toString())}]\nМинимум репутации: ${italic(work.metadata.minReputation.toString())}\nЗарплата: ${italic(work.metadata.salary.toString())}\n`,
  )
  .join('\n')}`;

export const SUB_COMMANDS = sub.reduce((accumulator, currentItem) => {
  accumulator[currentItem.subKey as SubCommand] = currentItem.commands
    .map(
      (command) => `${bold(command.name)} - ${italic(command.description)}\n`,
    )
    .join('\n');
  return accumulator;
}, {} as SubCommandsRecord);

export const CUTOFF_TIME = [
  60,
  3600,
  86400,
  86400 * 7,
  86400 * 30,
  86400 * 365,
  Infinity,
];

export const FLIP_CASES: Record<string, string> = {
  true: `${bold('Флиппер!')} Вы выиграли! Ваш баланс повышен на`,
  false: `${bold('Зеро!')} Вы проиграли! Ваш баланс снижен на`,
};

export const FLATTED_SHOPS = [
  ...shops.frames.flat(),
  ...shops.backgrounds.flat(),
  ...shops.other.flat(),
];
