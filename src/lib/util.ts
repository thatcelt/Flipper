export const generateCardDate = (): string => {
  const date = new Date();

  return `${String(date.getMonth() + 1).padStart(2, '0')}/${(date.getFullYear() + 4).toString().slice(2)}`;
};

export const generateCardNumber = (): string =>
  Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000).toString(),
  ).join(' ');

export const delay = async (seconds: number) =>
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const level = (experience: number) => {
  const safeExperience = Math.max(0, experience);
  const level = Math.floor(Math.sqrt(safeExperience / 100));

  return {
    level,
    maxExperience: 100 * Math.pow(level + 1, 2),
  };
};
