# Aura & Essentia

Tienda web del catálogo mayorista: dama, caballero y árabe / nicho. El cliente arma el pedido y lo envía por WhatsApp. El panel permite cambiar precios, fotos, disponibilidad y la promoción sin tocar código.

## Arrancar en este equipo

```bash
npm install
npm run seed
npm run dev
```

Abre http://localhost:3000

`npm run seed` vuelve a cargar los 342 productos del JSON y agrega el perfumero de viaje ($3.500) en cada línea. Si ya editaste precios en el panel, no vuelvas a correr el seed: reemplaza `data/products.json`.

## Panel de administración

- Dirección: http://localhost:3000/admin
- Usuario y contraseña: están en `.env.local` (`ADMIN_USER` y `ADMIN_PASSWORD`)
- En **Ajustes** se cambia el WhatsApp que recibe pedidos (con indicativo, ejemplo `573001112233`), Instagram, horario y el banner “-50% sin compra mínima”
- En **Productos** se crea, edita, sube foto, marca disponible o destacado, y se borra

Para cambiar la clave, edita `.env.local` y reinicia `npm run dev`.

## WhatsApp, colores y logo

- **WhatsApp:** panel → Ajustes → WhatsApp de pedidos. Sin ese número, el botón de enviar pedido no abre el chat.
- **Colores:** `app/globals.css`, variables `--color-gold`, `--color-ink` y los acentos `[data-cat="dama|caballero|arabe"]`.
- **Logo:** `public/logo.jpg`, el archivo original de la marca. El encabezado lo usa en `components/Logo.tsx`.

## Datos

- Catálogo activo: `data/products.json`
- Ajustes: `data/settings.json`
- Fotos subidas: `public/uploads`
- Origen del catálogo: `files/catalogo_dama.json`, `files/catalogo_caballero.json`, `files/catalogo_arabe.json`

Los nombres de casa se muestran como referencia del aroma. Cada ficha dice que es una fragancia inspirada, no el producto original.

## Publicar

En este equipo los cambios del panel se guardan en archivos. Eso funciona con `npm run dev` y con `npm run build` + `npm start` en un servidor que conserve el disco.

En Vercel el disco no conserva escrituras del panel. Para publicarla ahí y que precios y fotos sigan editables, el siguiente paso es conectar Supabase (base de datos y almacenamiento). Mientras tanto, un VPS o un PC encendido con `npm start` sí guarda lo que se edita.

Antes de abrirla al público:

1. Pon el WhatsApp real en Ajustes.
2. Cambia la contraseña del panel en `.env.local`.
3. Sube fotos de los destacados.
4. Revisa precios, sobre todo la línea árabe.
5. Prueba en el celular: buscar, agregar, enviar por WhatsApp.
