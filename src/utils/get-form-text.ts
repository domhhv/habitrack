/**
 * A text field's trimmed value, or an empty string when the field is missing or holds a file.
 */
const getFormText = (formData: FormData, name: string) => {
  const value = formData.get(name);

  return typeof value === 'string' ? value.trim() : '';
};

export default getFormText;
