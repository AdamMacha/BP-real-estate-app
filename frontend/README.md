# Real Estate Consumer - Frontend

Toto je frontendová část bakalářské práce zaměřené na agregaci a analýzu realitních dat.

## 🛠 Technologie

- **Next.js 15+** (App Router)
- **TypeScript** - typová bezpečnost
- **Tailwind CSS** - moderní a responzivní UI
- **Prisma ORM** - efektivní přístup k databázi
- **Clerk** - správa uživatelů a autentizace
- **Lucide React** - ikony

## 🚀 Spuštění

1. Nainstalujte závislosti:
   ```bash
   npm install
   ```

2. Nastavte `.env.local`:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/realestate_db"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   ```

3. Inicializujte databázi (pokryje i Prisma Client):
   ```bash
   npx prisma db push
   ```

4. Spusťte vývojový server:
   ```bash
   npm run dev
   ```

Frontend bude dostupný na [http://localhost:3000](http://localhost:3000).

## 📂 Struktura

- `src/app/` - Stránky a API routy
- `src/components/` - Znovupoužitelné UI komponenty (PropertyCard, Header, atd.)
- `src/lib/` - Konfigurace (Prisma klient, utility)
- `prisma/` - Schéma databáze
