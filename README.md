# Huancayork · gestión inmobiliaria local

Aplicación React/Vite con API local para MySQL. MySQL Workbench sirve para
administrar el servidor y la base; la aplicación se conecta mediante la API
Node.js y nunca desde el navegador directamente.

## Preparar la conexión local

1. Usa una base MySQL llamada `inmobiliaria` que ya tenga creadas sus tablas.
   Para las pantallas de gestión se requieren permisos `SELECT`, `INSERT` y
   `UPDATE` en las tablas de inmuebles, clientes, asesores, visitas, contratos,
   historial, notificaciones, comentarios y cuentas de la aplicación. La API
   no ofrece operaciones para borrar registros.
2. Copia `.env.example` a `.env` y completa el usuario, contraseña y puerto de
   MySQL. Define también una contraseña fuerte en `ADMIN_PASSWORD`.
3. No publiques ni compartas `.env`.
4. Inicia la API y Vite en terminales separadas:

   ```powershell
   npm run api:dev
   npm run dev
   ```

   Abre la URL local indicada por Vite. La API escucha solo en
   `127.0.0.1:3001` (o el puerto `API_PORT`) y el proxy local de Vite reenvía
   las solicitudes `/api`.

5. Ejecuta una sola vez
   `database/migrations/20261006_app_users_visit_status.sql` en MySQL Workbench.
   Es una migración aditiva: crea la tabla de accesos `app_usuario` y agrega el
   estado de seguimiento a `visitant`. Las visitas existentes conservan sus
   datos y reciben el valor inicial `Programada`. No elimina ni vacía tablas.

El acceso al panel administrador acepta `Yino@gmail.com`, `Yefri@gmail.com`,
`Diego@gmail.com` y `Antonio@gmail.com`, con nombres visibles Yino, Yefri,
Diego y Antonio. Los cuatro comparten la contraseña local `ADMIN_PASSWORD`.
El token se guarda solo en memoria y vence después de ocho horas. Los perfiles
cliente y agente necesitan una cuenta que el administrador habilita desde la
ficha del cliente o asesor. La contraseña se guarda con hash scrypt; el token
de sesión vence después de ocho horas.
No publiques el servidor Vite en una red ni despliegues esta API tal cual en
internet.

## Datos que se muestran

- El catálogo consulta los inmuebles reales. Los datos personales de clientes y
  los contratos solo se muestran a una cuenta autorizada.
- El panel **Reportes** requiere sesión de administrador y permite seleccionar
  una tabla, buscar registros y marcar las columnas que se desean exportar a
  `.xlsx`, `.pdf` o `.docx`. La búsqueda se aplica a la vista previa y al archivo.
- **Admin > Propiedades, Clientes, Asesores, Visitas y Contratos** consulta y
  guarda cambios en sus tablas de MySQL. Un contrato de venta/alquiler actualiza
  el estado del inmueble y su historial dentro de una transacción.
- Las visitas solicitadas por clientes y las de seguimiento de agentes se
  guardan en `visitant`; las solicitudes de información sobre un inmueble crean
  una notificación para el asesor asignado.
- El panel de administrador y los reportes operativos se calculan desde la base.
  Los reportes no incluyen los hashes de contraseñas de `app_usuario`.
- **Admin > Propiedades** permite abrir o cerrar para clientes los comentarios
  asociados a cada inmueble.
- Los comentarios iniciales son textos de muestra, identificados como tales; no
  son opiniones reales. Ejecuta `database/migrations/20261005_property_comments.sql`
  en MySQL Workbench una vez para crear y cargar la tabla de comentarios. Puedes
  volver a ejecutarlo para añadir comentarios a inmuebles agregados después.
- Los archivos de exportación se generan en el navegador; la API no escribe en
  la base de datos.

La consulta de inmuebles requiere que existan las tablas `inmueble`, `estadosi`,
`tipo_inmueble` y `asesores`, con las columnas referenciadas en `server/index.js`.
Si el esquema difiere, la API muestra el error de conexión/consulta y debe
ajustarse a ese esquema antes de usar el catálogo.

**Importante:** revisa cualquier script SQL antes de importarlo. Un script que
contenga instrucciones como `TRUNCATE`, `DELETE` o inserciones de datos
personales no debe ejecutarse como si fuera solo el esquema. Esta aplicación no
ejecuta automáticamente archivos SQL.
