---
title: Karavan
kind: web
order: 1
url: https://krvn.cemozcelik.dev
summary: Türkiye'deki karavancıların gittikleri yerleri artıları, eksileri ve fotoğraflarıyla haritada işaretlediği uygulama.
notes:
  - Konumlar PostgreSQL + PostGIS üzerinde tutuluyor; SQLAlchemy (async) ve GeoAlchemy2 ile mekânsal sorgular yapılıyor, şema değişiklikleri Alembic ile yönetiliyor.
  - Yüklenen görseller Pillow ile işlenip aioboto3 üzerinden S3 uyumlu depolamaya gönderiliyor.
  - Kimlik doğrulama JWT (python-jose) ve bcrypt ile; istek doğrulaması Pydantic ile yapılıyor.
  - Harita MapLibre GL ile çiziliyor; istemci tarafında state Zustand, sunucu verisi TanStack Query ve Axios ile yönetiliyor.
  - Backend, frontend ve veritabanı Docker Compose ile tek komutla ayağa kalkıyor.
stack: [Python, FastAPI, PostgreSQL, PostGIS, React 19, TypeScript, Tailwind CSS, MapLibre GL, Docker Compose]
---
