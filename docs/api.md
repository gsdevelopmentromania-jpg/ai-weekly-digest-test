# API Reference

Base URL: `http://localhost:3000` (development) / your production domain.

All responses use this JSON envelope:

```ts
{
  data:   T | null;      // payload on success, null on error
  error:  string | null; // error message on failure, null on success
  status: number;        // mirrors the HTTP status code
}
```

---

## Digests

### `GET /api/digests`

Returns a paginated list of published digest issues, ordered by `publishedAt` descending.

#### Query Parameters

| Param | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `page` | integer | `1` | positive integer | Page number (1-indexed) |
| `perPage` | integer | `10` | 1–100 | Results per page |

#### Success Response — `200 OK`

```json
{
  "data": {
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "slug": "week-12-2026",
        "title": "AI Weekly — Week 12, 2026",
        "weekLabel": "Week 12, 2026",
        "publishedAt": "2026-03-24T00:00:00.000Z",
        "summary": "This week in AI: ...",
        "items": [],
        "tags": ["llm", "policy", "tools"],
        "createdAt": "2026-03-24T10:00:00.000Z",
        "updatedAt": "2026-03-24T10:00:00.000Z"
      }
    ],
    "total": 42,
    "page": 1,
    "perPage": 10,
    "totalPages": 5
  },
  "error": null,
  "status": 200
}
```

#### Error Responses

| Status | Condition |
|---|---|
| `400` | Invalid query parameters (e.g. non-numeric `page`) |
| `500` | Unexpected server / database error |

---

### `GET /api/digests/:slug`

Returns a single digest issue identified by its URL slug, including all `items`.

#### Path Parameter

| Param | Type | Description |
|---|---|---|
| `slug` | string | URL-friendly slug, e.g. `week-12-2026` |

#### Success Response — `200 OK`

```json
{
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "slug": "week-12-2026",
    "title": "AI Weekly — Week 12, 2026",
    "weekLabel": "Week 12, 2026",
    "publishedAt": "2026-03-24T00:00:00.000Z",
    "summary": "This week in AI: ...",
    "items": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "issueId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "title": "GPT-5 Released",
        "url": "https://openai.com/blog/gpt-5",
        "source": "OpenAI Blog",
        "summary": "OpenAI announced ...",
        "category": "product",
        "publishedAt": "2026-03-22T09:00:00.000Z",
        "position": 0,
        "createdAt": "2026-03-24T10:00:00.000Z"
      }
    ],
    "tags": ["llm", "product"],
    "createdAt": "2026-03-24T10:00:00.000Z",
    "updatedAt": "2026-03-24T10:00:00.000Z"
  },
  "error": null,
  "status": 200
}
```

#### Error Responses

| Status | Condition |
|---|---|
| `400` | Missing or invalid `slug` parameter |
| `404` | No digest found with the given slug |
| `500` | Unexpected server / database error |

---

## Subscribers

### `POST /api/subscribe`

Subscribe an email address to the newsletter.

#### Request Body

```json
{ "email": "reader@example.com" }
```

| Field | Type | Constraints |
|---|---|---|
| `email` | string | Valid email, max 254 characters |

#### Success Response — `201 Created`

```json
{
  "data": {
    "id": "uuid",
    "email": "reader@example.com",
    "subscribedAt": "2026-03-30T14:00:00.000Z",
    "confirmed": false,
    "unsubscribedAt": null,
    "createdAt": "2026-03-30T14:00:00.000Z"
  },
  "error": null,
  "status": 201
}
```

#### Error Responses

| Status | Condition |
|---|---|
| `400` | Invalid JSON body or email fails validation |
| `500` | Unexpected server / database error |

---

### `DELETE /api/subscribe`

Unsubscribe an email address. Marks the subscriber record with the current timestamp in `unsubscribedAt`.

#### Request Body

```json
{ "email": "reader@example.com" }
```

#### Success Response — `200 OK`

```json
{
  "data": { "email": "reader@example.com" },
  "error": null,
  "status": 200
}
```

#### Error Responses

| Status | Condition |
|---|---|
| `400` | Invalid JSON body or email fails validation |
| `404` | Email not found in subscriber list |
| `500` | Unexpected server / database error |

---

## Data Models

### `DigestIssue`

```ts
interface DigestIssue {
  id:          string;         // UUID
  slug:        string;         // lowercase alphanumeric + hyphens
  title:       string;
  weekLabel:   string;
  publishedAt: ISODateString;
  summary:     string;
  items:       DigestItem[];
  tags:        string[];
  createdAt:   ISODateString;
  updatedAt:   ISODateString;
}
```

### `DigestItem`

```ts
interface DigestItem {
  id:          string;           // UUID
  issueId:     string;           // UUID — parent DigestIssue
  title:       string;
  url:         string;
  source:      string;
  summary:     string;
  category:    DigestCategory;   // 'research' | 'product' | 'industry' | 'tools' | 'policy' | 'other'
  publishedAt: ISODateString;
  position:    number;           // display order within the issue
  createdAt:   ISODateString;
}
```

### `Subscriber`

```ts
interface Subscriber {
  id:              string;
  email:           string;
  subscribedAt:    ISODateString;
  confirmed:       boolean;
  unsubscribedAt:  ISODateString | null;
  createdAt:       ISODateString;
}
```

### `ApiResponse<T>`

```ts
interface ApiResponse<T> {
  data:   T | null;
  error:  string | null;
  status: number;
}
```

### `PaginatedResult<T>`

```ts
interface PaginatedResult<T> {
  items:      T[];
  total:      number;
  page:       number;
  perPage:    number;
  totalPages: number;
}
```

Full type definitions: [`types/index.ts`](../types/index.ts)  
Full Zod schemas: [`lib/schemas.ts`](../lib/schemas.ts)
