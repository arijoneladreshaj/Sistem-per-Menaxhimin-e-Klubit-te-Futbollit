# Sistem për Menaxhimin e Klubit të Futbollit — Manchester United FC

Platformë e plotë web për menaxhimin e klubit të futbollit. Mundëson menaxhimin e lojtarëve, ndeshjet, biletat, dyqanin, trajnimet, kontratat, transferimet dhe shumë më tepër.

---

## Teknologjitë e Përdorura

| Shtresa | Teknologjia |
|---|---|
| Frontend | ReactJS + Vite |
| Stilizimi | Bootstrap 5 + Bootstrap Icons |
| Backend | Node.js + Express.js |
| Databaza | Microsoft SQL Server (MSSQL) |
| Autentifikimi | JWT (Access Token + Refresh Token) |

---

## Instalimi dhe Startimi

### Kërkesat paraprake
- Node.js v18+
- Microsoft SQL Server
- Git

### 1. Klono projektin
```bash
git clone https://github.com/arijoneladreshaj/Sistem-per-Menaxhimin-e-Klubit-te-Futbollit.git
cd Sistem-per-Menaxhimin-e-Klubit-te-Futbollit
```

### 2. Instalo frontend
```bash
npm install
```

### 3. Instalo backend
```bash
cd backend
npm install
```

### 4. Konfiguro variablat e mjedisit
Krijo file `.env` brenda folderit `backend/`:
```env
DB_SERVER=localhost
DB_NAME=FootballClubDB
DB_USER=sa
DB_PASSWORD=fjalëkalimi_yt
JWT_SECRET=secret_key_access
JWT_REFRESH_SECRET=secret_key_refresh
```

### 5. Starto backend
```bash
cd backend
node server.js
# Serveri starton në http://localhost:5001
```

### 6. Starto frontend
```bash
# nga root i projektit
npm run dev
# Aplikacioni hapet në http://localhost:5173
```

---

## Rolet e Sistemit

| Roli | Aksesi |
|---|---|
| `user` | Faqet publike, blerja e biletave, dyqani, profili |
| `Lojtari` | + Dashboard profili, formacioni |
| `Trajner` | + Lojtarët, trajnimet, dëmtimet, formacioni |
| `Menaxher` | + Store, biletat, kontratat, transferimet |
| `Admin` | Akses i plotë në të gjitha faqet |

---

## Autentifikimi — JWT Flow

Sistemi përdor dy lloje tokenesh:

- **Access Token** — skadon pas **15 minutave**, dërgohet si `Authorization: Bearer <token>`
- **Refresh Token** — skadon pas **7 ditëve**, ruhet në databazë (tabela `RefreshTokens`)

Kur Access Token skadon, fronti automatikisht (pa e vënë re useri) thërret `/refresh` dhe merr token të ri.

---

## Dokumentacioni i API-së

Të gjitha endpoint-at janë te bazës `http://localhost:5001`

### Auth (publike)

| Metoda | Endpoint | Përshkrimi |
|---|---|---|
| POST | `/login` | Kyçja — merr `username/email` + `password`, kthen `accessToken` + `refreshToken` |
| POST | `/register` | Regjistrimi i userit të ri |
| POST | `/refresh` | Merr Access Token të ri duke përdorur Refresh Token |
| POST | `/logout` | Revokimi i Refresh Token (çkyçja) |

**Shembull — Login:**
```json
POST /login
Body: { "username": "user1", "password": "123456" }

Response: {
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": 1, "username": "user1", "role": "Admin" }
}
```

---

### Lojtarët

Base path: `/api/players`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/players` | Jo | — |
| GET | `/api/players/:id` | Jo | — |
| POST | `/api/players` | JWT | Admin, Trajner |
| PUT | `/api/players/:id` | JWT | Admin, Trajner |
| DELETE | `/api/players/:id` | JWT | Admin, Trajner |

---

### Ndeshjet

Base path: `/api/ndeshjet`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/ndeshjet` | Jo | — |
| GET | `/api/ndeshjet/next-upcoming` | Jo | — |
| GET | `/api/ndeshjet/:id` | Jo | — |
| POST | `/api/ndeshjet` | JWT | Admin |
| PUT | `/api/ndeshjet/:id` | JWT | Admin |
| DELETE | `/api/ndeshjet/:id` | JWT | Admin |

---

### Lajmet

Base path: `/api/lajme`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/lajme` | Jo | — |
| POST | `/api/lajme` | JWT | Admin |
| PUT | `/api/lajme/:id` | JWT | Admin |
| DELETE | `/api/lajme/:id` | JWT | Admin |

---

### Biletat

Base path: `/api/tickets`

| Metoda | Endpoint | Auth | Roli | Përshkrimi |
|---|---|---|---|---|
| GET | `/api/tickets/booked/:matchId/:sektori` | Jo | — | Ulëset e zëna |
| GET | `/api/tickets/my` | JWT | Çdo user | Biletat e userit |
| GET | `/api/tickets` | JWT | Admin, Menaxher | Të gjitha biletat |
| GET | `/api/tickets/match/:matchId` | JWT | Admin, Menaxher | Biletat e ndeshjes |
| POST | `/api/tickets` | JWT | Çdo user | Blerja e biletave |
| PUT | `/api/tickets/:id` | JWT | Admin, Menaxher | Modifikimi i biletës |
| DELETE | `/api/tickets/:id` | JWT | User (veten) / Admin | Fshirja e biletës |

---

### Dyqani (Store)

Base path: `/store`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/store` | Jo | — |
| GET | `/store/:id` | Jo | — |
| POST | `/store` | JWT | Admin, Menaxher |
| PUT | `/store/:id` | JWT | Admin, Menaxher |
| DELETE | `/store/:id` | JWT | Admin, Menaxher |

---

### Trajnimet

Base path: `/api/training`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/training` | JWT | Çdo user i kyçur |
| POST | `/api/training` | JWT | Admin, Trajner |
| PUT | `/api/training/:id` | JWT | Admin, Trajner |
| DELETE | `/api/training/:id` | JWT | Admin, Trajner |

---

### Dëmtimet

Base path: `/api/injuries`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/injuries` | JWT | Admin, Trajner |
| POST | `/api/injuries` | JWT | Admin, Trajner |
| PUT | `/api/injuries/:id` | JWT | Admin, Trajner |
| DELETE | `/api/injuries/:id` | JWT | Admin, Trajner |

---

### Kontratat

Base path: `/api/contracts`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/contracts` | JWT | Admin, Menaxher |
| POST | `/api/contracts` | JWT | Admin, Menaxher |
| PUT | `/api/contracts/:id` | JWT | Admin, Menaxher |
| DELETE | `/api/contracts/:id` | JWT | Admin, Menaxher |

---

### Transferimet

Base path: `/api/transfers`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/transfers` | JWT | Admin, Menaxher |
| POST | `/api/transfers` | JWT | Admin, Menaxher |
| PUT | `/api/transfers/:id` | JWT | Admin, Menaxher |
| DELETE | `/api/transfers/:id` | JWT | Admin, Menaxher |

---

### Stafi

Base path: `/api/staff`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/staff` | JWT | Admin |
| POST | `/api/staff` | JWT | Admin |
| PUT | `/api/staff/:id` | JWT | Admin |
| DELETE | `/api/staff/:id` | JWT | Admin |

---

### Klubet

Base path: `/api/clubs`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/clubs` | Jo | — |
| POST | `/api/clubs` | JWT | Admin |
| PUT | `/api/clubs/:id` | JWT | Admin |
| DELETE | `/api/clubs/:id` | JWT | Admin |

---

### Sezionet

Base path: `/api/seasons`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/seasons` | Jo | — |
| POST | `/api/seasons` | JWT | Admin |
| PUT | `/api/seasons/:id` | JWT | Admin |
| DELETE | `/api/seasons/:id` | JWT | Admin |

---

### Formacioni (Lineup)

Base path: `/api/lineup`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/lineup/:matchId` | JWT | Çdo user i kyçur |
| POST | `/api/lineup` | JWT | Admin, Trajner |
| DELETE | `/api/lineup/:matchId` | JWT | Admin, Trajner |

---

### Notifikimet

Base path: `/api/notifications`

| Metoda | Endpoint | Auth | Roli |
|---|---|---|---|
| GET | `/api/notifications` | JWT | Çdo user i kyçur |
| PUT | `/api/notifications/:id/read` | JWT | Çdo user i kyçur |
| DELETE | `/api/notifications/:id` | JWT | Çdo user i kyçur |

---

### Të tjera

| Metoda | Endpoint | Auth | Përshkrimi |
|---|---|---|---|
| GET/PUT | `/api/users` | JWT | Profili i userit |
| GET/PUT | `/api/preferences` | JWT | Preferencat e lajmërimeve |
| GET/POST | `/api/favorites` | JWT | Lojtarët e preferuar |
| GET/POST | `/api/orders` | JWT | Porositë e dyqanit |
| GET/POST/PUT/DELETE | `/api/admin/users` | JWT (Admin) | Menaxhimi i përdoruesve |
| GET/PUT | `/api/homepage` | JWT | Përmbajtja e faqes kryesore |
| POST | `/api/newsletter` | Jo | Regjistrim në newsletter |
| POST | `/api/contact` | Jo | Mesazhe kontakti |
| POST | `/api/shipping` | JWT | Të dhënat e transportit |

---

## Struktura e Projektit

```
├── src/                        # Frontend (React)
│   ├── api/
│   │   └── axiosInstance.js    # Axios me JWT interceptor + auto-refresh
│   ├── Components/             # NavBar, Footer, SideBar
│   ├── Context/
│   │   └── CartContext.jsx     # Menaxhimi i shportës
│   └── pages/
│       ├── Dashboard/          # Faqet e admin/trajner/menaxher
│       ├── BuyTicketsPage/     # Flow blerjes së biletave
│       ├── ProfilePages/       # Profili i userit
│       └── ...                 # Faqet publike
│
└── backend/                    # Backend (Node.js + Express)
    ├── server.js               # Pika hyrëse, regjistrim i routes
    ├── db.js                   # Lidhja me MSSQL
    ├── middleware/
    │   └── authMiddleware.js   # verifyToken, requireRole
    └── Routes/                 # 26 route file-a (një për çdo entitet)
```

---

## Siguria

- Fjalëkalimet ruhen me **bcrypt** (salt 10)
- Çdo endpoint i mbrojtur kërkon `Authorization: Bearer <token>` në header
- Refresh Token ruhet në databazë dhe mund të revokohet me logout
- Role-based authorization — çdo veprim i kufizuar sipas rolit
