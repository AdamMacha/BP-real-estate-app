# Dokumentace testování (Bakalářská práce)

Tento dokument slouží jako podklad pro kapitolu o testování v bakalářské práci. Obsahuje přehled testovacích scénářů, metodiku testování a výsledky ověření klíčových funkcí aplikace.

## 1. Metodika testování

Aplikace byla testována kombinací dvou přístupů:
1. **Manuální testování (Black-box):** Ověření uživatelského rozhraní (UI) a celkového chování systému z pohledu koncového uživatele.
2. **Integrační testování API:** Automatizované ověření správné komunikace mezi backendem (Python/FastAPI), databází a externími zdroji dat (Sreality, Bezrealitky).

---

## 2. Přehled testovacích scénářů

### 2.1 Manuální testy (Frontend + UI)

| ID | Název testu | Popis kroku | Očekávaný výsledek | Stav |
|:---|:---|:---|:---|:---|
| M1 | Načtení seznamu nemovitostí | Otevření hlavní stránky aplikace. | Zobrazí se karty s nemovitostmi z obou zdrojů. | ✅ OK |
| M2 | Filtrace podle města | Zadání "Praha" do filtru lokality. | Seznam obsahuje pouze nemovitosti s adresou v Praze. | ✅ OK |
| M3| Filtrace podle ceny | Nastavení minimální a maximální ceny. | Zobrazené nemovitosti spadají do zadaného cenového intervalu. | ✅ OK |
| M4 | Zobrazení detailu | Kliknutí na tlačítko "Zobrazit detail" u náhodné karty. | Otevře se stránka s kompletním popisem, fotogalerií a technickými parametry. | ✅ OK |
| M5 | Responzivita UI | Změna velikosti okna prohlížeče na mobilní zobrazení. | Layout se přizpůsobí (změna mřížky karet, mobilní menu). | ✅ OK |

### 2.2 Integrační testy (Backend / API)

| ID | Endpoint | Metoda | Cíl testu | Výsledek (HTTP) | Stav |
|:---|:---|:---|:---|:---|:---|
| A1 | `/health` | GET | Ověření dostupnosti API a stavu scraperů. | 200 OK | ✅ OK |
| A2 | `/scrape/status` | GET | Získání statistik o počtu záznamů v DB. | 200 OK | ✅ OK |
| A3 | `/scrape/sreality` | POST | Spuštění asynchronního scrape úlohy pro Sreality. | 200 OK (started) | ✅ OK |
| A4 | `/scrape/bezrealitky` | POST | Ověření startu scraperu pro Bezrealitky. | 200 OK (started) | ✅ OK |
| A5 | Neexistující ID | GET | Požadavek na detail neexistující nemovitosti. | 404 Not Found | ✅ OK |

---

## 3. Validace specifikací a hraniční stavy

### 3.1 Prázdná databáze
*   **Scénář:** Vymazání databáze (pomocí `clear_db.py`) a následné načtení frontendu.
*   **Očekávané chování:** Aplikace nespadne, zobrazí korektní informaci "Nebyly nalezeny žádné nemovitosti".
*   **Výsledek:** ✅ Ověřeno. Frontend ošetřuje prázdné pole `data`.

### 3.2 Chyba externího API (Scraping)
*   **Scénář:** Odpojení internetu nebo zadání neplatné URL pro scraping.
*   **Očekávané chování:** Scraper zaznamená chybu do logu, retry mechanismus (knihovna `tenacity`) se pokusí o znovupřipojení, backend nezamrzne.
*   **Výsledek:** ✅ Ověřeno. Díky `BackgroundTasks` zůstává API responzivní i při selhání scraperu.

### 3.3 Validace filtrů (Kombinace)
*   **Scénář:** Kombinace Prodej + Byt + Praha.
*   **Očekávané chování:** SQL dotaz v Prismě vygeneruje správný `WHERE` klauzuli.
*   **Výsledek:** ✅ Ověřeno.

---

## 4. Doporučení pro obhajobu

Při demonstraci aplikace doporučuji ukázat:
1. **Živé spuštění scraperu** (přes Postman nebo `/health` endpoint).
2. **Rychlou filtraci** na frontendu (ukázka bleskové odezvy díky indexům v DB).
3. **Detail nemovitosti**, kde je vidět stažený textový popis (důkaz, že scraper navštěvuje i detailní stránky).

---
*Dokument vytvořen jako součást BP - BP Real Estate App.*
