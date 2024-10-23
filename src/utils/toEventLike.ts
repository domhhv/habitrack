export type ChangeEventLike = {
  target: {
    value: string;
  };
};

export const toEventLike = (value: string = ''): ChangeEventLike => {
  return {
    target: {
      value,
    },
  };
};
