rm -rf .wrangler
npm run db:migrate:local
sed -i '' 's/^DEV="false"$/DEV="true"/' .dev.vars
npm run dev &
sleep 5
http post http://localhost:8787/create
npx tsx src/lib/seed.ts seed-rtt-locations
npx tsx src/lib/seed.ts seed-test-users
# close down dev
kill %1
sed -i '' 's/^DEV="true"$/DEV="false"/' .dev.vars
