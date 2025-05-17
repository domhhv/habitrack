const toHashMap = <T extends { id: string }>(items: T[]) => {
  return Object.fromEntries(
    items.map((item) => {
      return [item.id, item];
    })
  );
};

export default toHashMap;
