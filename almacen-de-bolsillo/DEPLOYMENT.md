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

El backend queda publicado en el puerto externo `3103` del VPS y usa el puerto interno `3000` del contenedor. Esto permite acceder temporalmente mediante la IP del servidor:

```text
http://IP_DEL_SERVIDOR:3103
```

Si el VPS usa UFW, permitir el puerto:

```bash
sudo ufw allow 3103/tcp
```

Comprobar el servicio desde el VPS:

```bash
curl http://127.0.0.1:3103/health
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

## Despliegue automático

El workflow `.github/workflows/deploy-backend.yml` actualiza este directorio desde GitHub cuando hay cambios relevantes en `main`:

```text
/opt/apps/almacen-de-bolsillo-repo/almacen-de-bolsillo
```

También puede ejecutarse manualmente desde `Actions → Deploy backend → Run workflow`.

El acceso SSH usa el usuario `deploy-almacen-de-bolsillo` en el puerto `5460`. La conexión se autentica mediante una clave almacenada en GitHub como `VPS_SSH_KEY`.

La documentación completa de CI/CD está en [`docs/CI-CD.md`](../docs/CI-CD.md).
