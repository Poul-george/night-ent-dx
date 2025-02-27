This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

prismaのマイグレーション作成
```
npx prisma migrate dev --name <migration_name> --create-only
```

prismaのマイグレーション実行
```
npx prisma migrate dev
```

ローカルのsuapbase dbを起動
```
supabase start
```

変更を保存して終了
```
supabase stop
```

supabaseディレクトリ以下のマイグレーションやseed.sqlがローカルDBに反映される
```
supabase db reset
```

リモート環境のDBとローカル環境を同期
```
supabase link
```

リモート環境のDBとローカル環境内容をseed.sqlに同期
```
supabase db dump -f supabase/seed.sql
```

supabase操作DOC
https://supabase.com/docs/reference/cli/supabase-db-push