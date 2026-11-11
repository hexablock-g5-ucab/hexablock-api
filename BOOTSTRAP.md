# Bootstrap (first day only)

Nest cannot be generated inside a non-empty folder, so generate it next to the repo and copy it in
without overwriting our files:

```bash
cd ..
npx @nestjs/cli new nest-tmp --package-manager npm --skip-git
cp -rn nest-tmp/. hexablock-api/          # -n: never overwrite scaffold files
rm -rf nest-tmp && cd hexablock-api
npm i @nestjs/swagger @nestjs/jwt @nestjs/passport passport-jwt bcrypt class-validator class-transformer @prisma/client
npm i -D prisma @types/passport-jwt @types/bcrypt @commitlint/cli @commitlint/config-conventional lefthook
npm pkg set scripts.prepare="lefthook install" && npm run prepare
cp .env.example .env
docker compose up -d db
npx prisma migrate dev --name init
npm run test && npm run test:e2e
```

Delete this file in the bootstrap commit: `chore(repo): bootstrap nestjs project`.
