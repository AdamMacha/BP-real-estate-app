# Dokumentace testovaní (Bakalářská práce)

Tento dokument slouží jako podklad pro kapitolu o testování v bakalářské práci. Obsahuje přehled testovacích scénářů, metodiku testování a výsledky ověření klíčových funkcí aplikace.

---

## 1. Metodika testování

Aplikace byla testována kombinací tří základních přístupů:
1. **Manuální testování (Black-box):** Ověření uživatelského rozhraní (UI) a celkového chování systému z pohledu koncového uživatele.
2. **Integrační testování API:** Automatizované i manuální ověření správné komunikace mezi backendem (Python/FastAPI), databází a externími zdroji dat.
3. **Validace datového schématu:** Kontrola konzistence dat mezi scraperem (SQLAlchemy) a aplikačním rozhraním (Prisma).

---

## 2. Testované API Endpointy

### 2.1 Backend Scraper (Port 8000)
Tyto endpointy slouží k ovládání a monitorování procesu získávání dat.

| Metoda | Endpoint | Cíl testu | Očekávaný výsledek | Stav |
|:---|:---|:---|:---|:---|
| `GET` | `/health` | Health check celého systému | Vrátí JSON se stavem "ok" a dostupností služeb. | ✅ OK |
| `GET` | `/scrape/status` | Monitoring běžících úloh | Vrátí počet inzerátů v DB a status posledního scrapingu. | ✅ OK |
| `POST` | `/scrape/sreality` | Spuštění scraperu pro Sreality | Spustí asynchronní úlohu, vrátí potvrzení o startu. | ✅ OK |
| `POST` | `/scrape/bezrealitky` | Spuštění scraperu pro Bezrealitky | Spustí asynchronní úlohu (Next.js data extraction). | ✅ OK |
| `POST` | `/scrape/all` | Hromadné spuštění všech zdrojů | Spustí sekvenční scrapování všech portálů. | ✅ OK |

### 2.2 Aplikační API (Next.js - Port 3000)
Tyto endpointy slouží k obsluze frontendu a komunikaci s databází přes Prisma ORM.

| Metoda | Endpoint | Cíl testu | Očekávaný výsledek | Stav |
|:---|:---|:---|:---|:---|
| `GET` | `/api/properties` | Načtení seznamu s filtry | Vrátí stránkovaný seznam + tržní medián (medianPricePerM2). | ✅ OK |
| `GET` | `/api/properties/[id]` | Detail konkrétní nemovitosti | Vrátí všechna pole inzerátu včetně textového popisu. | ✅ OK |
| `GET` | `/api/properties?city=Praha` | Filtrace podle lokality | Vrátí pouze záznamy z Prahy (case-insensitive). | ✅ OK |
| `POST` | `/api/favorites` | Uložení do oblíbených | Vytvoří záznam v tabulce `favorites` (vyžaduje auth). | ✅ OK |
| `GET` | `/api/properties/[fake-id]` | Ošetření chyb (404) | Správně vrátí HTTP 404 a chybovou hlášku. | ✅ OK |

---

## 3. Manuální UI Testy (Frontend)

| ID | Název testu | Popis kroku | Očekávaný výsledek | Stav |
|:---|:---|:---|:---|:---|:---|
| **M1** | Zobrazení dashboardu | Otevření hlavní stránky. | Zobrazí se mřížka karet s reálnými daty z DB. | ✅ OK |
| **M2** | Funkčnost filtrů | Změna ceny a typu (Byt/Dům). | Seznam se okamžitě aktualizuje podle parametrů. | ✅ OK |
| **M3** | Tržní analýza (Badge) | Kontrola karty s výhodnou cenou. | Zobrazí se zelený badge "-X% pod mediánem". | ✅ OK |
| **M4** | Stránka detailu | Proklik z karty na detail. | Načte se detailní popis a galerie fotek. | ✅ OK |
| **M5** | Responzivita | Test na mobilním zařízení. | Menu se sbalí do "hamburgeru", karty jsou pod sebou. | ✅ OK |
| **M6** | Autentizace (Clerk) | Přihlášení uživatele. | Zpřístupní se sekce "Oblíbené" a synchronizace profilu. | ✅ OK |

---

## 4. Hraniční stavy a validace stability

### 4.1 Prázdná databáze
*   **Scénář:** Vymazání databáze a následné načtení frontendu.
*   **Výsledek:** UI nezamrzne, zobrazí korektní informaci "Žádné nemovitosti nenalezeny".

### 4.2 Duplicita dat (Deduplikace)
*   **Scénář:** Opakované spuštění scraperu pro stejný portál.
*   **Výsledek:** Díky unikátnímu klíči `external_id` (indexovanému) nedochází k duplicitám, data se pouze aktualizují (`upsert` v SQL logice).

### 4.3 Odolnost proti změnám v HTML (Bezrealitky)
*   **Scénář:** Změna vizuálního layoutu Bezrealitky.
*   **Výsledek:** Scraper zůstává funkční, protože extrahuje surová data z Next.js Apollo Cache, nikoliv z DOM elementů (odstraněna závislost na Playwright).

---

