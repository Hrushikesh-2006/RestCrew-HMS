@echo off
echo Deploying with Vercel project environment variables...
echo Make sure DATABASE_URL, PASSWORD_PEPPER, and Firebase env vars are set in Vercel.
npx vercel --prod --yes
