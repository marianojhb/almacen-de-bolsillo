# CI/CD

El proyecto usa GitHub Actions para validar cambios, desplegar el backend y generar la APK Android.

## Workflows

Los workflows están en `.github/workflows/`:

| Workflow | Ejecución | Resultado |
| --- | --- | --- |
| `CI` | Pull Request, push a `main` o manual | Compila `shared` y backend, valida Expo y genera el bundle Android |
| `Deploy backend` | Cambios de backend/Docker en `main` o manual | Actualiza el VPS, ejecuta migraciones y reinicia Docker |
| `Build Android APK` | Manual o tags `v*` | Genera una APK mediante EAS |

El CI solo valida; no modifica el VPS. El deploy del backend y el build de APK son procesos separados.

## Secretos de GitHub

Configurar en `Settings → Secrets and variables → Actions`:

```text
VPS_HOST=IP_DEL_SERVIDOR
VPS_PORT=5460
VPS_USER=deploy-almacen-de-bolsillo
VPS_SSH_KEY=<clave privada del deploy>
VPS_KNOWN_HOSTS=<salida de ssh-keyscan>
EXPO_TOKEN=<token de Expo>
```

Obtener la huella del servidor:

```bash
ssh-keyscan -p 5460 -H IP_DEL_SERVIDOR
```

Las claves privadas nunca se guardan en Git ni en la documentación.

## Deploy del backend

El VPS utiliza esta ruta:

```text
/opt/apps/almacen-de-bolsillo-repo/almacen-de-bolsillo
```

El usuario `deploy-almacen-de-bolsillo` necesita acceso SSH mediante clave al puerto `5460`, permiso para usar Docker, permisos sobre el repositorio y acceso de lectura a `backend/.env.production`.

El workflow ejecuta:

```bash
git pull --ff-only origin main
docker compose -f compose.production.yaml build backend
docker compose -f compose.production.yaml --profile tools run --rm migrate
docker compose -f compose.production.yaml up -d --force-recreate backend
```

El healthcheck final verifica `http://127.0.0.1:3103/health`.

## Acceso público

Caddy recibe las peticiones HTTP por la IP pública y las envía al backend:

```text
http://IP_DEL_SERVIDOR → 127.0.0.1:3103
```

La aplicación móvil usa la URL pública sin el puerto interno:

```text
EXPO_PUBLIC_API_URL=http://IP_DEL_SERVIDOR
```

Actualmente el acceso es HTTP porque esta aplicación no tiene dominio configurado. Para producción pública conviene migrar a HTTPS.

## Generar APK

Desde GitHub: `Actions → Build Android APK → Run workflow`.

También se genera al publicar un tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

La APK usa el perfil EAS `preview` y queda configurada con la URL pública del backend. Una nueva APK no se instala automáticamente; hay que descargarla e instalarla.

## EAS Update

EAS Build es necesario cuando cambian dependencias nativas, permisos o configuración Android. Para cambios únicamente de JavaScript o assets se puede incorporar EAS Update posteriormente.
