const LIGHT_BACKGROUND_LUMINANCE = 0.6;

const getReadableTextColor = (backgroundColor: string) => {
  const hex = backgroundColor.replace('#', '');
  const fullHex =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => {
            return char + char;
          })
          .join('')
      : hex;

  if (!/^[\da-f]{6}/i.test(fullHex)) {
    return '#fff';
  }

  const [red, green, blue] = [0, 2, 4].map((start) => {
    return parseInt(fullHex.slice(start, start + 2), 16) / 255;
  });
  const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;

  return luminance > LIGHT_BACKGROUND_LUMINANCE ? '#000' : '#fff';
};

export default getReadableTextColor;
