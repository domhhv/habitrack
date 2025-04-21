const isTruthy = <T>(value: T | null | undefined): value is T => {
  return Boolean(value);
};

export default isTruthy;
