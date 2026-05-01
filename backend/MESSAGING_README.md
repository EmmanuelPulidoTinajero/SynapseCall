# NexusFlow Messaging Backend

Este backend centraliza la comunicación de **Discord, Telegram y Facebook Messenger** integrándolos con Firebase Firestore para su visualización en la aplicación móvil NexusFlow.

## Arquitectura

El proyecto sigue el **Modular Adapter Pattern**:
- **Adapters (`src/core/adapters/`)**: Normalizan los mensajes de cada plataforma.
- **Interfaces (`src/core/interfaces/`)**: Definen el contrato estándar de mensajes.
- **Services (`src/services/`)**: Manejan la lógica de persistencia en Firebase.
- **Webhooks (`src/webhooks/`)**: Endpoints para plataformas que requieren Webhooks (Facebook).

## Requisitos Previos

1. **Node.js**: v22 o superior.
2. **Firebase**: Un proyecto configurado en la consola de Firebase.
3. **Credenciales**:
   - Descarga el archivo JSON de la cuenta de servicio de Firebase y configúralo en tu entorno.

## Configuración (.env)

Añade las siguientes variables a tu archivo `SynapseCall/backend/.env`:

```env
# Firebase
GOOGLE_APPLICATION_CREDENTIALS="ruta/a/tu/service-account.json"

# Telegram
TELEGRAM_TOKEN="tu_token_de_botfather"

# Discord
DISCORD_TOKEN="tu_token_de_discord_developer_portal"

# Facebook
FB_PAGE_TOKEN="tu_page_access_token"
FB_VERIFY_TOKEN="tu_token_de_verificacion_personalizado"

# App Settings
DEFAULT_ORG_ID="default_org"
```

## Instalación

```bash
cd SynapseCall/backend
npm install
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Flujo de Mensajes

1. **Recepción**: Un usuario envía un mensaje por Telegram/Discord/Facebook.
2. **Adaptador**: El backend recibe el mensaje y lo transforma al formato interno.
3. **Firebase**: El mensaje se guarda en la colección `chats` y subcolección `messages` de Firestore.
4. **App Móvil**: La aplicación NexusFlow muestra el mensaje en tiempo real mediante los Streams de Firestore.

## Conventional Commits

Este proyecto sigue la convención de commits:
- `feat`: Nueva funcionalidad (ej: `feat: add telegram adapter`).
- `fix`: Corrección de errores.
- `docs`: Cambios en documentación.
- `chore`: Tareas de mantenimiento.
