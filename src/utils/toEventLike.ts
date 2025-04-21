const toEventLike = (value: string = '') => {
  return {
    target: {
      value,
    },
  };
};

export default toEventLike;
