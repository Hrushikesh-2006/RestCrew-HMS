const fs = require('fs');

const script = [
  '@echo off',
  'echo Deploying with Vercel project environment variables...',
  'echo Make sure DATABASE_URL, PASSWORD_PEPPER, and Firebase env vars are set in Vercel.',
  'npx vercel --prod --yes',
  '',
].join('\r\n');

fs.writeFileSync('deploy.bat', script);
console.log('deploy.bat generated without embedding secrets');
