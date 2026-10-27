# Despliegue del backend con Docker

El Compose de producción ejecuta solamente la API. PostgreSQL debe estar disponible externamente mediante las URLs configuradas en el entorno.

## Preparar el entorno

Desde la raíz del workspace, crear el archivo de variables sin versionarlo:

```bash
cp backend/.env.production.example backend/.env.production
```

Completar `DATABASE_URL` con la conexión usada por la API y `DIRECT_URL` con una conexión directa apta para migraciones.

## Construir y migrar

```bash
docker compose -f compose.production.yaml build backend
docker compose -f compose.production.yaml --profile tools run --rm migrate
```

Las migraciones son explícitas: no se ejecutan automáticamente cuando la API reinicia.

## Iniciar la API

```bash
docker compose -f compose.production.yaml up -d backend
docker compose -f compose.production.yaml ps
```

El puerto queda publicado solamente en `127.0.0.1:3000` para que un proxy inverso del VPS, como Nginx o Caddy, sea el único punto de acceso público.

Comprobar el servicio desde el VPS:

```bash
curl http://127.0.0.1:3000/health
```

La respuesta esperada es `{"status":"ok"}`.

## Actualizar

Después de descargar una versión nueva:

```bash
docker compose -f compose.production.yaml build backend
docker compose -f compose.production.yaml --profile tools run --rm migrate
docker compose -f compose.production.yaml up -d backend
```

Consultar los logs con:

```bash
docker compose -f compose.production.yaml logs --tail=100 backend
```
