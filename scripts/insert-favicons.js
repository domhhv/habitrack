const fs = require('fs');

const faviconNames = [
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'apple-touch-icon.png',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon.ico',
  'site.webmanifest',
];

const insertFavicons = async () => {
  return fs.readdir('./public', (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    const favicons = files.filter((file) => faviconNames.includes(file));
    favicons.forEach((favicon) => {
      fs.copyFile(`./public/${favicon}`, `./dist/${favicon}`, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`${favicon} was copied to dist`);
      });
    });
  });
};

insertFavicons();
