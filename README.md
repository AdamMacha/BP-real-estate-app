# Real Estate Aggregator

Agregátor nemovitostí z realitních portálů **sreality.cz** a **bezrealitky.cz**. Aplikace umožňuje prohlížet všechny inzeráty na jednom místě a srovnávat ceny.

## Architektura

- **Frontend**: Next.js 16+ s TypeScript a Tailwind CSS
- **Backend**: Python FastAPI pro web scraping
- **Database**: PostgreSQL 15
- **Scraping**: 
  - Sreality.cz - Neoficiální JSON API
  - Bezrealitky.cz - Playwright web scraping

## Požadavky

- Docker a Docker Compose
- Node.js 20+ (pro lokální vývoj bez Dockeru)
- Python 3.11+ (pro lokální vývoj bez Dockeru)

## Rychlé spuštění (Docker)

### 1. Naklonujte repozitář

```bash
cd /Users/adammacha/Desktop/Bakalářská\ práce/BP-Aplikace
```

### 2. Vytvořte environment soubory

**Scraper (.env):**
```bash
cp scraper/.env.example scraper/.env
```

**Frontend (.env.local):**
```bash
# V adresáři frontend vytvořte .env.local s:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/realestate_db
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Spusťte aplikaci pomocí Docker Compose

```bash
docker-compose up -d
```

To spustí:
- PostgreSQL na portu `5432`
- Python scraper API na portu `8000`
- Next.js frontend na portu `3000`

### 4. Inicializujte databázi

```bash
# Spusťte migrace
cd frontend
npm install
npx prisma generate
npx prisma db push
```

### 5. Spusťte scraping

Otevřete prohlížeč a navštivte:
```
http://localhost:8000/scrape/all?max_pages=3
```

Nebo použijte curl:
```bash
curl -X POST "http://localhost:8000/scrape/all?max_pages=3"
```

### 6. Otevřete aplikaci

Přejděte na:
```
http://localhost:3000
```

## 💻 Lokální vývoj (bez Dockeru)

### Backend (Python Scraper)

```bash
cd scraper

# Vytvořte virtuální prostředí
python -m venv venv
source venv/bin/activate  # Na Windows: venv\Scripts\activate

# Nainstalujte závislosti
pip install -r requirements.txt

# Nainstalujte Playwright prohlížeče
playwright install chromium

# Spusťte databázi
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=realestate_db \
  postgres:15-alpine

# Inicializujte databázi
python database.py

# Spusťte server
uvicorn main:app --reload
```

### Frontend (Next.js)

```bash
cd frontend

# Nainstalujte závislosti
npm install

# Vygenerujte Prisma klienta
npx prisma generate

# Synchronizujte databázové schéma
npx prisma db push

# Spusťte dev server
npm run dev
```

## API Endpoints

### Scraper API (Port 8000)

- `GET /` - Health check
- `GET /health` - Detailní health check
- `POST /scrape/sreality` - Scrape sreality.cz
  - Query params: `category_main`, `category_type`, `max_pages`
- `POST /scrape/bezrealitky` - Scrape bezrealitky.cz
  - Query params: `transaction_type`, `property_type`, `locality`, `max_pages`
- `POST /scrape/all` - Scrape všechny zdroje
  - Query params: `max_pages`
- `GET /scrape/status` - Status scrapingu a statistiky

### Next.js API (Port 3000)

- `GET /api/properties` - Získat nemovitosti s filtry
  - Query params: `city`, `minPrice`, `maxPrice`, `minSize`, `maxSize`, `propertyType`, `transactionType`, `roomCount`, `page`, `limit`, `sortBy`, `sortOrder`
- `GET /api/properties/[id]` - Detail konkrétní nemovitosti

## 🎯 Funkce

### ✅ Implementováno

- ✅ Scraping sreality.cz přes JSON API
- ✅ Scraping bezrealitky.cz pomocí Playwright
- ✅ PostgreSQL databáze s Prisma ORM
- ✅ RESTful API v FastAPI
- ✅ Next.js frontend s Tailwind CSS
- ✅ Filtrování podle ceny, lokace, velikosti
- ✅ Responsivní design
- ✅ Pagination
- ✅ Docker Compose setup

### 🔄 Plánované

- ⏳ Ukládání oblíbených inzerátů (vyžaduje autentizaci)
- ⏳ Email notifikace pro nové inzeráty
- ⏳ Automatický denní scraping přes cron
- ⏳ Detail stránka nemovitosti
- ⏳ Material-UI alternativa pro srovnání

## 📁 Struktura projektu

```
BP-Aplikace/
├── scraper/                 # Python scraping service
│   ├── scrapers/
│   │   ├── base.py         # Base scraper class
│   │   ├── sreality.py     # Sreality scraper
│   │   └── bezrealitky.py  # Bezrealitky scraper
│   ├── main.py             # FastAPI aplikace
│   ├── database.py         # SQLAlchemy modely
│   ├── config.py           # Konfigurace
│   ├── scheduler.py        # APScheduler pro cron
│   └── requirements.txt
├── frontend/               # Next.js aplikace
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/     # React komponenty
│   │   ├── lib/           # Utility funkce
│   │   └── types/         # TypeScript typy
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
└── docker-compose.yml      # Docker orchestrace
```

## 🔧 Konfigurace

### Scraper Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:port/database
API_HOST=0.0.0.0
API_PORT=8000
REQUEST_DELAY=1.0
MAX_RETRIES=3
SCRAPE_CRON_HOUR=2
SCRAPE_CRON_MINUTE=0
```

### Frontend Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤝 Přispívání

Projekt je součástí bakalářské práce. Pro návrhy a bug reporty vytvořte issue.

## 📄 Licence

Tento projekt je vytvořen pro akademické účely.

## ⚠️ Upozornění

Web scraping může porušovat Terms of Service některých webových stránek.
