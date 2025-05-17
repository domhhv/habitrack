const toHashMap = <T extends { id: string }>(items: T[]) => {
  if (!items || !items.length) {
    return {};
  }

  return Object.fromEntries(
    items.map((item) => {
      return [item.id, item];
    })
  );
};

export default toHashMap;
