# Real Estate Analysis App (Bakalářská práce)

Agregátor nemovitostí z portálů **sreality.cz** a **bezrealitky.cz**. Aplikace slouží k centralizovanému prohlížení inzerátů, sledování cenových trendů a výpočtu investičního potenciálu.

## Architektura

Aplikace je rozdělena na dvě hlavní části:

1.  **Backend Scraper (Python/FastAPI)**:
    *   **Sreality.cz** - Extrakce dat přes JSON API (vícenásobné asynchronní dotazy).
    *   **Bezrealitky.cz** - Přímá extrakce Next.js Apollo Cache (lekce z GraphQL bez nutnosti prohlížeče).
2.  **Frontend & App API (Next.js/Prisma)**:
    *   **Dashboard** - Přehledné filtrování, řazení a tržní analýza (výpočet mediánu v reálném čase).
    *   **Filtry** - Lokalita, cena, plocha, transakce.
    *   **Správa** - Systém oblíbených s ukládáním poznámek a statusu (např. "prohlídka").

## Technologie

-   **Frontend**: Next.js 15+, TypeScript, Tailwind CSS, Clerk (auth)
-   **Backend**: Python 3.11+, FastAPI, SQLAlchemy, httpx, BeautifulSoup4
-   **Databáze**: PostgreSQL 15, Prisma ORM
-   **Infrastruktura**: Docker, Docker Compose

---

## Rychlé spuštění (Docker)

1.  **Příprava environmentu**:
    ```bash
    cp scraper/.env.example scraper/.env
    # V adresáři frontend vytvořte .env.local s:
    DATABASE_URL=postgresql://postgres:postgres@db:5432/realestate_db
    ```

2.  **Spuštění celé stacku**:
    ```bash
    docker-compose up -d
    ```

3.  **Inicializace databáze**:
    ```bash
    cd frontend && npm install && npx prisma db push
    ```

4.  **První scrapování**:
    Navštivte [http://localhost:8000/scrape/all?max_pages=3](http://localhost:8000/scrape/all?max_pages=3) nebo použijte curl:
    ```bash
    curl -X POST "http://localhost:8000/scrape/all?max_pages=3"
    ```

5.  **Aplikace**:
    Dostupná na [http://localhost:3000](http://localhost:3000).

---

## Struktura projektu

-   `scraper/` - Autonomní služba pro sběr a normalizaci dat do DB.
    -   `scrapers/` - Implementace jednotlivých portálů.
    -   `tools/` - Utility pro správu (mazání, migrace).
-   `frontend/` - Webová aplikace a API rozhraní pro uživatele.
    -   `prisma/` - Schéma databáze (**jednotný zdroj pravdy**).
    -   `src/app/api/` - Endpointy pro frontend a tržní statistiky.
-   `docker-compose.yml` - Definice kontejnerů a sítí.

---

## Seznam testovaných funkcí

V projektu se nachází dokument [**testing_results.md**](./testing_results.md), který detailně popisuje testovací scénáře (API i UI).

**Klíčové testy zahrnují:**
-   Správnost výpočtu tržního mediánu (`medianPricePerM2`).
-   Stabilitu extrakce dat bez využití prohlížeče (Playwright byl nahrazen efektivnějšími metodami).
-   Responzivitu rozhraní a správu stavů "Favoritů".

---
*Vytvořeno jako součást bakalářské práce.*
