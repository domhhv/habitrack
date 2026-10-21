const pickDefinedValues = <T>(record: Record<string, T | undefined>) => {
  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, T] => {
      return entry[1] !== undefined;
    })
  );
};

export default pickDefinedValues;
