export const getHabitIconUrl = (image?: string) => {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/habit_icons/${
    image || 'default.png'
  }`;
};
