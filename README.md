# CallMyBluff

A Next.js betting platform with real-time market data and user interactions.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn or pnpm
- PostgreSQL (v13 or higher)

## Environment Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd callmybluff
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
# Database URLs
DATABASE_URL="postgresql://username:password@localhost:5432/callmybluff"
DIRECT_URL="postgresql://username:password@localhost:5432/callmybluff"

# Supabase Configuration (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Setup

1. Create a PostgreSQL database named `callmybluff`

2. Generate Prisma Client:

```bash
npx prisma generate
```

3. Run database migrations:

```bash
# Reset the database and apply all migrations
npx prisma migrate reset --force

# Create a new migration and apply it
npx prisma migrate dev --name add_markets
```

4. Seed the database with initial data:

```bash
npx prisma db seed
```

## Running the Application

1. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
callmybluff/
├── prisma/               # Database schema and migrations
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── lib/            # Utility functions and configurations
│   ├── pages/          # Next.js pages
│   ├── services/       # Business logic and API services
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database

## Database Management

### Creating New Migrations

When you make changes to the Prisma schema (`prisma/schema.prisma`), create a new migration:

```bash
npx prisma migrate dev --name describe_your_change
```

### Reset Database

To reset the database and apply all migrations:

```bash
npx prisma migrate reset --force
```

### View Database

To view and manage your database with Prisma Studio:

```bash
npx prisma studio
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**

   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. **Migration Issues**

   - Try resetting the database: `npx prisma migrate reset --force`
   - Delete `node_modules/.prisma` and run `npx prisma generate`

3. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
