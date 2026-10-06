import "dotenv/config"

import crypto from "node:crypto"

import express from "express"

import mysql from "mysql2/promise"
import { promisify } from "node:util"

const app = express()

const port = Number(process.env.API_PORT || 3001)

const database = process.env.MYSQL_DATABASE || "inmobiliaria"

const adminPassword = process.env.ADMIN_PASSWORD || ""

const adminUsers = new Map([
  ["yino@gmail.com", "Yino"],
  ["yefri@gmail.com", "Yefri"],
  ["diego@gmail.com", "Diego"],
  ["antonio@gmail.com", "Antonio"],
])

const sessionLifetimeMs = 8 * 60 * 60 * 1000

const sessions = new Map()
const scrypt = promisify(crypto.scrypt)

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",

  port: Number(process.env.MYSQL_PORT || 3306),

  user: process.env.MYSQL_USER || "root",

  password: process.env.MYSQL_PASSWORD || "",

  database,

  waitForConnections: true,

  connectionLimit: 5,

  decimalNumbers: true,
})

app.disable("x-powered-by")

app.use(express.json({ limit: "16kb" }))

function sendDatabaseError(res, error, publicMessage) {
  console.error(publicMessage, error)

  res.status(503).json({ error: publicMessage })
}

function serializeRows(rows) {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        if (value instanceof Date) return [key, value.toISOString()]

        if (Buffer.isBuffer(value)) return [key, value.toString("base64")]

        if (typeof value === "bigint") return [key, value.toString()]

        return [key, value]
      }),
    ),
  )
}

function passwordMatches(provided) {
  const expectedBuffer = Buffer.from(adminPassword)

  const providedBuffer = Buffer.from(
    typeof provided === "string" ? provided : "",
  )

  return (
    expectedBuffer.length > 0 &&
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  )
}

function requireAdmin(req, res, next) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "")

  const session = token ? sessions.get(token) : undefined

  if (
    !token ||
    !session ||
    session.role !== "admin" ||
    session.expiresAt < Date.now()
  ) {
    if (token) sessions.delete(token)

    return res.status(401).json({ error: "Inicia sesión como administrador." })
  }

  next()
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1")

    res.json({ ok: true, database })
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "No se pudo conectar con la base de datos local.",
    )
  }
})

app.get("/api/properties", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        i.id_inmueble AS id,
        i.direccion AS address,
        i.ciudad AS district,
        i.metros2 AS area,
        i.habitaciones AS bedrooms,
        i.banos AS bathrooms,
        i.precio AS price,
        e.nombre_estado AS status,
        t.nombre_tipo AS category,
        (
          SELECT image.ruta_imagen
          FROM imagen_inmueble image
          WHERE image.id_inmueble = i.id_inmueble
          ORDER BY image.es_principal DESC, image.fecha_subida DESC
          LIMIT 1
        ) AS image_url,
        i.id_asesor AS agent_id,
        i.id_tipo AS type_id,
        i.id_zona AS zone_id,
        CONCAT_WS(' ', a.nombre, a.apellido) AS agent_name,
        a.telefono AS agent_phone,
        a.email AS agent_email
      FROM inmueble i
      LEFT JOIN estadosi e ON e.id_estado = i.id_estado
      LEFT JOIN tipo_inmueble t ON t.id_tipo = i.id_tipo
      LEFT JOIN asesores a ON a.id_asesor = i.id_asesor
      ORDER BY i.id_inmueble`,
    )

    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar los inmuebles.")
  }
})

app.get("/api/properties/:propertyId/comments", async (req, res) => {
  const propertyId = Number(req.params.propertyId)
  if (!Number.isSafeInteger(propertyId) || propertyId < 1) {
    return res
      .status(400)
      .json({ error: "Identificador de inmueble inválido." })
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
        id_comentario AS id,
        id_inmueble AS property_id,
        autor AS author,
        texto AS text,
        es_muestra AS is_sample,
        fecha_creacion AS created_at
      FROM comentario_inmueble
      WHERE id_inmueble = ? AND visible_para_clientes = TRUE
      ORDER BY orden`,
      [propertyId],
    )
    res.json({ open: rows.length > 0, comments: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar los comentarios.")
  }
})

app.post("/api/admin/login", (req, res) => {
  if (!adminPassword) {
    return res.status(503).json({
      error:
        "Configura ADMIN_PASSWORD en el archivo .env para habilitar el administrador.",
    })
  }

  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : ""
  const name = adminUsers.get(email)

  if (!name || !passwordMatches(req.body?.password)) {
    return res
      .status(401)
      .json({ error: "Usuario o contraseña de administrador incorrectos." })
  }

  const token = crypto.randomBytes(32).toString("hex")

  sessions.set(token, {
    expiresAt: Date.now() + sessionLifetimeMs,
    email,
    role: "admin",
  })

  res.json({
    token,
    user: {
      id: `admin-${email}`,
      name,
      email,
      role: "admin",
    },
  })
})

app.post("/api/login", async (req, res) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : ""
  const password =
    typeof req.body?.password === "string" ? req.body.password : ""
  const role = req.body?.role

  if (!email || !password || !["cliente", "agente"].includes(role)) {
    return res.status(400).json({ error: "Completa correo, contraseña y perfil." })
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
        u.id_usuario,
        u.correo,
        u.clave_hash,
        u.rol,
        u.id_cliente,
        u.id_asesor,
        CASE
          WHEN u.rol = 'cliente' THEN CONCAT_WS(' ', c.nombre, c.apellido)
          ELSE CONCAT_WS(' ', a.nombre, a.apellido)
        END AS nombre
      FROM app_usuario u
      LEFT JOIN clientes c ON c.id_cliente = u.id_cliente
      LEFT JOIN asesores a ON a.id_asesor = u.id_asesor
      WHERE u.correo = ? AND u.rol = ?
      LIMIT 1`,
      [email, role],
    )
    const account = rows[0]
    const [salt, storedHash] = account?.clave_hash?.split(":") ?? []
    const expected = storedHash ? Buffer.from(storedHash, "hex") : Buffer.alloc(0)
    const actual = salt
      ? await scrypt(password, salt, expected.length || 64)
      : Buffer.alloc(0)

    if (
      !account ||
      !salt ||
      !storedHash ||
      actual.length !== expected.length ||
      !crypto.timingSafeEqual(actual, expected)
    ) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const userRole = role === "cliente" ? "client" : "agent"
    const userId =
      role === "cliente" ? String(account.id_cliente) : String(account.id_asesor)

    sessions.set(token, {
      expiresAt: Date.now() + sessionLifetimeMs,
      email,
      role: userRole,
      userId,
      clientId: account.id_cliente ? String(account.id_cliente) : null,
      agentId: account.id_asesor ? String(account.id_asesor) : null,
    })

    res.json({
      token,
      user: {
        id: userId,
        name: account.nombre,
        email,
        role: userRole,
      },
    })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo iniciar sesión.")
  }
})

function requireRole(role) {
  return (req, res, next) => {
    const token = req.get("authorization")?.replace(/^Bearer\s+/i, "")
    const session = token ? sessions.get(token) : undefined
    if (!session || session.role !== role || session.expiresAt < Date.now()) {
      if (token) sessions.delete(token)
      return res.status(401).json({ error: "Inicia sesión con una cuenta autorizada." })
    }
    req.account = session
    next()
  }
}

const requireClient = requireRole("client")
const requireAgent = requireRole("agent")

app.get("/api/client/visits", requireClient, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT v.id_visita AS id, v.id_inmueble AS property_id,
        CONCAT_WS(', ', i.direccion, i.ciudad) AS property,
        CONCAT_WS(' ', a.nombre, a.apellido) AS agent,
        DATE_FORMAT(v.fecha_visita, '%Y-%m-%d') AS visit_date,
        DATE_FORMAT(v.fecha_visita, '%H:%i') AS visit_time,
        v.estado AS status, v.observacion AS notes
      FROM visitant v JOIN inmueble i ON i.id_inmueble = v.id_inmueble
      JOIN asesores a ON a.id_asesor = v.id_asesor
      WHERE v.id_cliente = ? ORDER BY v.fecha_visita DESC`,
      [req.account.clientId],
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar tus visitas.")
  }
})

app.post("/api/client/visits", requireClient, async (req, res) => {
  const { propertyId, date, time, notes } = req.body ?? {}
  if (!Number.isSafeInteger(Number(propertyId)) || Number(propertyId) < 1 ||
      typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: "Selecciona una propiedad, fecha y hora válidas." })
  }
  try {
    const [[property]] = await pool.execute(
      `SELECT i.id_asesor, e.nombre_estado FROM inmueble i
      JOIN estadosi e ON e.id_estado = i.id_estado WHERE i.id_inmueble = ?`,
      [propertyId],
    )
    if (!property) return res.status(404).json({ error: "No se encontró el inmueble." })
    if (!property.id_asesor) {
      return res.status(409).json({ error: "Este inmueble aún no tiene un asesor asignado." })
    }
    if (property.nombre_estado !== "Disponible") {
      return res.status(409).json({ error: "Solo puedes solicitar visita para inmuebles disponibles." })
    }
    const [result] = await pool.execute(
      `INSERT INTO visitant (id_inmueble, id_cliente, id_asesor, fecha_visita, estado, observacion)
      VALUES (?, ?, ?, ?, 'Programada', ?)`,
      [propertyId, req.account.clientId, property.id_asesor, `${date} ${time}:00`, notes || null],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo enviar la solicitud de visita.")
  }
})

app.post("/api/client/interests", requireClient, async (req, res) => {
  const propertyId = Number(req.body?.propertyId)
  if (!Number.isSafeInteger(propertyId) || propertyId < 1) {
    return res.status(400).json({ error: "Identificador de inmueble inválido." })
  }
  try {
    const [[property]] = await pool.execute(
      `SELECT i.direccion, i.ciudad, i.id_asesor, e.nombre_estado
      FROM inmueble i JOIN estadosi e ON e.id_estado = i.id_estado
      WHERE i.id_inmueble = ?`,
      [propertyId],
    )
    if (!property) return res.status(404).json({ error: "No se encontró el inmueble." })
    if (property.nombre_estado !== "Disponible") {
      return res.status(409).json({ error: "Este inmueble ya no está disponible." })
    }
    if (!property.id_asesor) {
      return res.status(409).json({ error: "Este inmueble aún no tiene un asesor asignado." })
    }
    const address = `${property.direccion}, ${property.ciudad}`.slice(0, 100)
    await pool.execute(
      `INSERT INTO notificacion (id_cliente, id_asesor, titulo, mensaje)
      VALUES (?, ?, 'Interés en inmueble', ?)`,
      [req.account.clientId, property.id_asesor, `Cliente solicita información para adquirir o alquilar: ${address}`.slice(0, 100)],
    )
    res.status(201).json({ sent: true })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo registrar el interés.")
  }
})

app.get("/api/client/contracts", requireClient, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id_contrato AS id, CONCAT_WS(', ', i.direccion, i.ciudad) AS property,
        c.tipo_contrato AS type, c.fecha_inicio AS start_date,
        c.fecha_fin AS end_date, c.monto AS amount
      FROM contrato c JOIN inmueble i ON i.id_inmueble = c.id_inmueble
      WHERE c.id_cliente = ? ORDER BY c.fecha_inicio DESC`,
      [req.account.clientId],
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar tus contratos.")
  }
})

app.get("/api/agent/properties", requireAgent, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT i.id_inmueble AS id, i.direccion AS address, i.ciudad AS district,
        i.metros2 AS area, i.habitaciones AS bedrooms, i.banos AS bathrooms,
        i.precio AS price, e.nombre_estado AS status, t.nombre_tipo AS category,
        (SELECT image.ruta_imagen FROM imagen_inmueble image
          WHERE image.id_inmueble = i.id_inmueble
          ORDER BY image.es_principal DESC, image.fecha_subida DESC LIMIT 1) AS image_url,
        i.id_asesor AS agent_id, i.id_tipo AS type_id, i.id_zona AS zone_id,
        CONCAT_WS(' ', a.nombre, a.apellido) AS agent_name,
        a.telefono AS agent_phone, a.email AS agent_email
      FROM inmueble i LEFT JOIN estadosi e ON e.id_estado = i.id_estado
      LEFT JOIN tipo_inmueble t ON t.id_tipo = i.id_tipo
      LEFT JOIN asesores a ON a.id_asesor = i.id_asesor
      WHERE i.id_asesor = ? ORDER BY i.id_inmueble`,
      [req.account.agentId],
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo cargar tu cartera.")
  }
})

app.get("/api/agent/visits", requireAgent, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT v.id_visita AS id, v.id_inmueble AS property_id,
        CONCAT_WS(', ', i.direccion, i.ciudad) AS property,
        v.id_cliente AS client_id, CONCAT_WS(' ', c.nombre, c.apellido) AS client,
        DATE_FORMAT(v.fecha_visita, '%Y-%m-%d') AS visit_date,
        DATE_FORMAT(v.fecha_visita, '%H:%i') AS visit_time,
        v.estado AS status, v.observacion AS notes
      FROM visitant v JOIN inmueble i ON i.id_inmueble = v.id_inmueble
      JOIN clientes c ON c.id_cliente = v.id_cliente
      WHERE v.id_asesor = ? ORDER BY v.fecha_visita DESC`,
      [req.account.agentId],
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar tus visitas.")
  }
})

app.get("/api/agent/options", requireAgent, async (req, res) => {
  try {
    const [properties] = await pool.execute(
      `SELECT i.id_inmueble AS id, CONCAT_WS(' · ', t.nombre_tipo, i.direccion, i.ciudad) AS name
      FROM inmueble i LEFT JOIN tipo_inmueble t ON t.id_tipo = i.id_tipo
      WHERE i.id_asesor = ? ORDER BY i.id_inmueble`,
      [req.account.agentId],
    )
    const [clients] = await pool.execute(
      `SELECT id_cliente AS id, CONCAT_WS(' ', nombre, apellido) AS name FROM clientes ORDER BY id_cliente`,
    )
    res.json({ properties: serializeRows(properties), clients: serializeRows(clients) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar las opciones de agenda.")
  }
})

app.post("/api/agent/visits", requireAgent, async (req, res) => {
  const { propertyId, clientId, date, time, notes } = req.body ?? {}
  if (!Number.isSafeInteger(Number(propertyId)) || Number(propertyId) < 1 ||
      !Number.isSafeInteger(Number(clientId)) || Number(clientId) < 1 ||
      typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: "Datos de visita inválidos." })
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO visitant (id_inmueble, id_cliente, id_asesor, fecha_visita, estado, observacion)
      SELECT i.id_inmueble, ?, i.id_asesor, ?, 'Programada', ?
      FROM inmueble i WHERE i.id_inmueble = ? AND i.id_asesor = ?`,
      [clientId, `${date} ${time}:00`, notes || null, propertyId, req.account.agentId],
    )
    if (!result.affectedRows) {
      return res.status(403).json({ error: "Solo puedes agendar visitas para los inmuebles de tu cartera." })
    }
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo programar la visita.")
  }
})

app.patch("/api/agent/visits/:id", requireAgent, async (req, res) => {
  const id = Number(req.params.id)
  const { status, notes } = req.body ?? {}
  if (!Number.isSafeInteger(id) || id < 1 ||
      !["Programada", "Confirmada", "Realizada", "Cancelada"].includes(status)) {
    return res.status(400).json({ error: "Estado de visita inválido." })
  }
  try {
    const [result] = await pool.execute(
      `UPDATE visitant SET estado = ?, observacion = ?
      WHERE id_visita = ? AND id_asesor = ?`,
      [status, notes || null, id, req.account.agentId],
    )
    if (!result.affectedRows) return res.status(404).json({ error: "No se encontró la visita asignada." })
    res.status(204).end()
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo actualizar el estado de la visita.")
  }
})

app.get("/api/agent/contracts", requireAgent, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id_contrato AS id, CONCAT_WS(', ', i.direccion, i.ciudad) AS property,
        CONCAT_WS(' ', cl.nombre, cl.apellido) AS client, c.tipo_contrato AS type,
        c.fecha_inicio AS start_date, c.fecha_fin AS end_date, c.monto AS amount
      FROM contrato c JOIN inmueble i ON i.id_inmueble = c.id_inmueble
      JOIN clientes cl ON cl.id_cliente = c.id_cliente
      WHERE c.id_asesor = ? ORDER BY c.fecha_inicio DESC`,
      [req.account.agentId],
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar tus contratos.")
  }
})

app.post("/api/logout", (req, res) => {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (token) sessions.delete(token)
  res.status(204).end()
})

app.use("/api/admin", requireAdmin)

app.post("/api/admin/accounts", async (req, res) => {
  const { role, id, password } = req.body ?? {}
  const numericId = Number(id)
  if (
    !["cliente", "agente"].includes(role) ||
    !Number.isSafeInteger(numericId) ||
    numericId < 1 ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return res.status(400).json({
      error: "Perfil, registro o contraseña inválidos (mínimo 8 caracteres).",
    })
  }

  try {
    const isClient = role === "cliente"
    const table = isClient ? "clientes" : "asesores"
    const idColumn = isClient ? "id_cliente" : "id_asesor"
    const [records] = await pool.execute(
      `SELECT ${idColumn} AS id, email FROM ${table} WHERE ${idColumn} = ?`,
      [numericId],
    )
    const email = records[0]?.email?.trim().toLowerCase()
    if (!email) {
      return res.status(400).json({
        error: "El registro necesita un correo en Inmobiliaria para habilitar su acceso.",
      })
    }

    const salt = crypto.randomBytes(16).toString("hex")
    const hash = await scrypt(password, salt, 64)
    await pool.execute(
      `INSERT INTO app_usuario (correo, clave_hash, rol, id_cliente, id_asesor)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        correo = VALUES(correo),
        clave_hash = VALUES(clave_hash),
        rol = VALUES(rol),
        id_cliente = VALUES(id_cliente),
        id_asesor = VALUES(id_asesor)`,
      [email, `${salt}:${hash.toString("hex")}`, role, isClient ? numericId : null, isClient ? null : numericId],
    )
    res.status(204).end()
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo guardar el acceso.")
  }
})

app.get("/api/admin/dashboard", async (_req, res) => {
  try {
    const [[properties], [visits], [sales], [agents]] = await Promise.all([
      pool.execute(
        `SELECT COUNT(*) AS total FROM inmueble i
        JOIN estadosi e ON e.id_estado = i.id_estado
        WHERE e.nombre_estado = 'Disponible'`,
      ),
      pool.execute(
        `SELECT COUNT(*) AS total FROM visitant
        WHERE estado IN ('Programada', 'Confirmada')
          AND fecha_visita >= NOW()`,
      ),
      pool.execute(
        `SELECT COALESCE(SUM(monto), 0) AS total FROM contrato
        WHERE tipo_contrato = 'venta'`,
      ),
      pool.execute(`SELECT COUNT(*) AS total FROM asesores`),
    ])
    res.json({
      activeProperties: Number(properties[0].total),
      upcomingVisits: Number(visits[0].total),
      sales: Number(sales[0].total),
      activeAgents: Number(agents[0].total),
    })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo cargar el resumen.")
  }
})

app.get("/api/admin/clients", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id_cliente AS id, nombre AS first_name, apellido AS last_name,
        dni, telefono AS phone, email, direccion AS address
      FROM clientes ORDER BY id_cliente`,
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar los clientes.")
  }
})

app.post("/api/admin/clients", async (req, res) => {
  const { firstName, lastName, dni, phone, email, address } = req.body ?? {}
  if (![firstName, lastName, dni].every((value) => typeof value === "string" && value.trim())) {
    return res.status(400).json({ error: "Nombres, apellidos y DNI son obligatorios." })
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO clientes (nombre, apellido, dni, telefono, email, direccion)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName.trim(), lastName.trim(), dni.trim(), phone || null, email || null, address || null],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo crear el cliente. Verifica los datos y el DNI.")
  }
})

app.patch("/api/admin/clients/:id", async (req, res) => {
  const id = Number(req.params.id)
  const { firstName, lastName, dni, phone, email, address } = req.body ?? {}
  if (!Number.isSafeInteger(id) || id < 1 || ![firstName, lastName, dni].every((value) => typeof value === "string" && value.trim())) {
    return res.status(400).json({ error: "Datos del cliente inválidos." })
  }
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [existingAccount] = await connection.execute(
      `SELECT id_usuario FROM app_usuario WHERE id_cliente = ?`,
      [id],
    )
    if (existingAccount.length && !email) {
      await connection.rollback()
      return res.status(400).json({ error: "Conserva un correo para no bloquear el acceso de este cliente." })
    }
    const [result] = await connection.execute(
      `UPDATE clientes SET nombre = ?, apellido = ?, dni = ?, telefono = ?, email = ?, direccion = ?
      WHERE id_cliente = ?`,
      [firstName.trim(), lastName.trim(), dni.trim(), phone || null, email || null, address || null, id],
    )
    if (!result.affectedRows) {
      await connection.rollback()
      return res.status(404).json({ error: "No se encontró el cliente." })
    }
    if (email) {
      await connection.execute(`UPDATE app_usuario SET correo = ? WHERE id_cliente = ?`, [email.trim().toLowerCase(), id])
    }
    await connection.commit()
    res.status(204).end()
  } catch (error) {
    await connection.rollback()
    sendDatabaseError(res, error, "No se pudo actualizar el cliente. Verifica los datos y el DNI.")
  } finally {
    connection.release()
  }
})

app.get("/api/admin/agents", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.id_asesor AS id, a.nombre AS first_name, a.apellido AS last_name,
        a.telefono AS phone, a.email,
        COALESCE((SELECT z.nombre_zona FROM inmueble i JOIN zona z ON z.id_zona = i.id_zona
          WHERE i.id_asesor = a.id_asesor ORDER BY i.id_inmueble LIMIT 1), 'Sin zona asignada') AS zone,
        (SELECT COUNT(*) FROM contrato c WHERE c.id_asesor = a.id_asesor AND c.tipo_contrato = 'venta') AS sales,
        (SELECT COALESCE(SUM(c.monto), 0) FROM contrato c WHERE c.id_asesor = a.id_asesor) AS volume
      FROM asesores a ORDER BY a.id_asesor`,
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar los asesores.")
  }
})

app.post("/api/admin/agents", async (req, res) => {
  const { firstName, lastName, phone, email } = req.body ?? {}
  if (![firstName, lastName].every((value) => typeof value === "string" && value.trim())) {
    return res.status(400).json({ error: "Nombres y apellidos son obligatorios." })
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO asesores (nombre, apellido, telefono, email)
      VALUES (?, ?, ?, ?)`,
      [firstName.trim(), lastName.trim(), phone || null, email || null],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo crear el asesor.")
  }
})

app.patch("/api/admin/agents/:id", async (req, res) => {
  const id = Number(req.params.id)
  const { firstName, lastName, phone, email } = req.body ?? {}
  if (!Number.isSafeInteger(id) || id < 1 || ![firstName, lastName].every((value) => typeof value === "string" && value.trim())) {
    return res.status(400).json({ error: "Datos del asesor inválidos." })
  }
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [existingAccount] = await connection.execute(
      `SELECT id_usuario FROM app_usuario WHERE id_asesor = ?`,
      [id],
    )
    if (existingAccount.length && !email) {
      await connection.rollback()
      return res.status(400).json({ error: "Conserva un correo para no bloquear el acceso de este asesor." })
    }
    const [result] = await connection.execute(
      `UPDATE asesores SET nombre = ?, apellido = ?, telefono = ?, email = ?
      WHERE id_asesor = ?`,
      [firstName.trim(), lastName.trim(), phone || null, email || null, id],
    )
    if (!result.affectedRows) {
      await connection.rollback()
      return res.status(404).json({ error: "No se encontró el asesor." })
    }
    if (email) {
      await connection.execute(`UPDATE app_usuario SET correo = ? WHERE id_asesor = ?`, [email.trim().toLowerCase(), id])
    }
    await connection.commit()
    res.status(204).end()
  } catch (error) {
    await connection.rollback()
    sendDatabaseError(res, error, "No se pudo actualizar el asesor.")
  } finally {
    connection.release()
  }
})

app.get("/api/admin/visits", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT v.id_visita AS id, v.id_inmueble AS property_id,
        CONCAT_WS(', ', i.direccion, i.ciudad) AS property,
        v.id_cliente AS client_id, CONCAT_WS(' ', c.nombre, c.apellido) AS client,
        v.id_asesor AS agent_id, CONCAT_WS(' ', a.nombre, a.apellido) AS agent,
        DATE_FORMAT(v.fecha_visita, '%Y-%m-%d') AS visit_date,
        DATE_FORMAT(v.fecha_visita, '%H:%i') AS visit_time,
        v.estado AS status, v.observacion AS notes
      FROM visitant v
      JOIN inmueble i ON i.id_inmueble = v.id_inmueble
      JOIN clientes c ON c.id_cliente = v.id_cliente
      JOIN asesores a ON a.id_asesor = v.id_asesor
      ORDER BY v.fecha_visita DESC`,
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar las visitas.")
  }
})

app.post("/api/admin/visits", async (req, res) => {
  const { propertyId, clientId, agentId, date, time, status, notes } = req.body ?? {}
  if (![propertyId, clientId, agentId].every((id) => Number.isSafeInteger(Number(id)) && Number(id) > 0) ||
      typeof date !== "string" || typeof time !== "string" ||
      !["Programada", "Confirmada", "Realizada", "Cancelada"].includes(status)) {
    return res.status(400).json({ error: "Datos de visita inválidos." })
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO visitant (id_inmueble, id_cliente, id_asesor, fecha_visita, estado, observacion)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [propertyId, clientId, agentId, `${date} ${time}:00`, status, notes || null],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo programar la visita.")
  }
})

app.patch("/api/admin/visits/:id", async (req, res) => {
  const id = Number(req.params.id)
  const { propertyId, clientId, agentId, date, time, status, notes } = req.body ?? {}
  if (!Number.isSafeInteger(id) || id < 1 ||
      ![propertyId, clientId, agentId].every((value) => Number.isSafeInteger(Number(value)) && Number(value) > 0) ||
      typeof date !== "string" || typeof time !== "string" ||
      !["Programada", "Confirmada", "Realizada", "Cancelada"].includes(status)) {
    return res.status(400).json({ error: "Datos de visita inválidos." })
  }
  try {
    const [result] = await pool.execute(
      `UPDATE visitant SET id_inmueble = ?, id_cliente = ?, id_asesor = ?,
        fecha_visita = ?, estado = ?, observacion = ? WHERE id_visita = ?`,
      [propertyId, clientId, agentId, `${date} ${time}:00`, status, notes || null, id],
    )
    if (!result.affectedRows) return res.status(404).json({ error: "No se encontró la visita." })
    res.status(204).end()
  } catch (error) {
    sendDatabaseError(res, error, "No se pudo actualizar la visita.")
  }
})

app.get("/api/admin/contracts", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id_contrato AS id, c.id_inmueble AS property_id,
        CONCAT_WS(', ', i.direccion, i.ciudad) AS property,
        c.id_cliente AS client_id, CONCAT_WS(' ', cl.nombre, cl.apellido) AS client,
        c.id_asesor AS agent_id, CONCAT_WS(' ', a.nombre, a.apellido) AS agent,
        c.tipo_contrato AS type, c.monto AS amount,
        c.fecha_inicio AS start_date, c.fecha_fin AS end_date
      FROM contrato c JOIN inmueble i ON i.id_inmueble = c.id_inmueble
      JOIN clientes cl ON cl.id_cliente = c.id_cliente
      JOIN asesores a ON a.id_asesor = c.id_asesor
      ORDER BY c.fecha_inicio DESC, c.id_contrato DESC`,
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar los contratos.")
  }
})

app.post("/api/admin/contracts", async (req, res) => {
  const { propertyId, clientId, agentId, type, amount, startDate, endDate } = req.body ?? {}
  if (![propertyId, clientId, agentId].every((id) => Number.isSafeInteger(Number(id)) && Number(id) > 0) ||
      !["venta", "alquiler"].includes(type) || !Number.isFinite(Number(amount)) || Number(amount) <= 0 ||
      typeof startDate !== "string") {
    return res.status(400).json({ error: "Datos de contrato inválidos." })
  }
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [[property]] = await connection.execute(
      `SELECT i.id_estado, e.nombre_estado FROM inmueble i
      JOIN estadosi e ON e.id_estado = i.id_estado
      WHERE i.id_inmueble = ? FOR UPDATE`,
      [propertyId],
    )
    if (!property || property.nombre_estado !== "Disponible") {
      await connection.rollback()
      return res.status(409).json({ error: "Solo se puede contratar un inmueble disponible." })
    }
    const [stateRows] = await connection.execute(
      `SELECT id_estado FROM estadosi WHERE nombre_estado = ? ORDER BY id_estado LIMIT 1`,
      [type === "venta" ? "Vendida" : "Alquilada"],
    )
    if (!stateRows.length) throw new Error("Falta el estado de venta o alquiler en estadosi.")
    const [result] = await connection.execute(
      `INSERT INTO contrato (id_inmueble, id_cliente, id_asesor, tipo_contrato, fecha_inicio, fecha_fin, monto)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [propertyId, clientId, agentId, type, startDate, endDate || null, amount],
    )
    await connection.execute(
      `UPDATE inmueble SET id_estado = ? WHERE id_inmueble = ?`,
      [stateRows[0].id_estado, propertyId],
    )
    await connection.execute(
      `INSERT INTO historial_estado (id_inmueble, id_estado_anterior, id_estado_nuevo, motivo)
      VALUES (?, ?, ?, ?)`,
      [propertyId, property.id_estado, stateRows[0].id_estado, `Contrato de ${type}`],
    )
    await connection.commit()
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    await connection.rollback()
    sendDatabaseError(res, error, "No se pudo registrar el contrato.")
  } finally {
    connection.release()
  }
})

app.post("/api/admin/properties", async (req, res) => {
  const { address, district, area, bedrooms, bathrooms, price, status, typeId, agentId, zoneId } = req.body ?? {}
  if (typeof address !== "string" || !address.trim() || typeof district !== "string" || !district.trim() ||
      !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ error: "Dirección, ciudad y precio válido son obligatorios." })
  }
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [[statusRow]] = await connection.execute(
      `SELECT id_estado FROM estadosi WHERE nombre_estado = ? ORDER BY id_estado LIMIT 1`,
      [status || "Disponible"],
    )
    if (!statusRow) {
      await connection.rollback()
      return res.status(400).json({ error: "El estado seleccionado no existe en la base de datos." })
    }
    const [result] = await connection.execute(
      `INSERT INTO inmueble (direccion, ciudad, metros2, habitaciones, banos, precio, id_estado, id_asesor, id_tipo, id_zona)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [address.trim(), district.trim(), area || null, bedrooms || 0, bathrooms || 0, price,
        statusRow.id_estado, agentId || null, typeId || null, zoneId || null],
    )
    await connection.execute(
      `INSERT INTO historial_estado (id_inmueble, id_estado_anterior, id_estado_nuevo, motivo)
      VALUES (?, NULL, ?, 'Registro inicial del inmueble')`,
      [result.insertId, statusRow.id_estado],
    )
    await connection.commit()
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    await connection.rollback()
    sendDatabaseError(res, error, "No se pudo registrar el inmueble.")
  } finally {
    connection.release()
  }
})

app.patch("/api/admin/properties/:id", async (req, res) => {
  const id = Number(req.params.id)
  const { address, district, area, bedrooms, bathrooms, price, status, typeId, agentId, zoneId } = req.body ?? {}
  if (!Number.isSafeInteger(id) || id < 1 || typeof address !== "string" || !address.trim() ||
      typeof district !== "string" || !district.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ error: "Datos del inmueble inválidos." })
  }
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [[current]] = await connection.execute(
      `SELECT id_estado FROM inmueble WHERE id_inmueble = ? FOR UPDATE`,
      [id],
    )
    if (!current) {
      await connection.rollback()
      return res.status(404).json({ error: "No se encontró el inmueble." })
    }
    const [[statusRow]] = await connection.execute(
      `SELECT id_estado FROM estadosi WHERE nombre_estado = ? ORDER BY id_estado LIMIT 1`,
      [status],
    )
    if (!statusRow) {
      await connection.rollback()
      return res.status(400).json({ error: "El estado seleccionado no existe en la base de datos." })
    }
    await connection.execute(
      `UPDATE inmueble SET direccion = ?, ciudad = ?, metros2 = ?, habitaciones = ?, banos = ?,
        precio = ?, id_estado = ?, id_asesor = ?, id_tipo = ?, id_zona = ? WHERE id_inmueble = ?`,
      [address.trim(), district.trim(), area || null, bedrooms || 0, bathrooms || 0, price,
        statusRow.id_estado, agentId || null, typeId || null, zoneId || null, id],
    )
    if (Number(current.id_estado) !== Number(statusRow.id_estado)) {
      await connection.execute(
        `INSERT INTO historial_estado (id_inmueble, id_estado_anterior, id_estado_nuevo, motivo)
        VALUES (?, ?, ?, 'Actualización desde panel administrador')`,
        [id, current.id_estado, statusRow.id_estado],
      )
    }
    await connection.commit()
    res.status(204).end()
  } catch (error) {
    await connection.rollback()
    sendDatabaseError(res, error, "No se pudo actualizar el inmueble.")
  } finally {
    connection.release()
  }
})

app.get("/api/admin/property-options", async (_req, res) => {
  try {
    const [states] = await pool.execute(`SELECT id_estado AS id, nombre_estado AS name FROM estadosi ORDER BY id_estado`)
    const [types] = await pool.execute(`SELECT id_tipo AS id, nombre_tipo AS name FROM tipo_inmueble ORDER BY id_tipo`)
    const [agents] = await pool.execute(`SELECT id_asesor AS id, CONCAT_WS(' ', nombre, apellido) AS name FROM asesores ORDER BY id_asesor`)
    const [zones] = await pool.execute(`SELECT id_zona AS id, nombre_zona AS name FROM zona ORDER BY id_zona`)
    const [properties] = await pool.execute(
      `SELECT i.id_inmueble AS id, CONCAT_WS(' · ', t.nombre_tipo, i.direccion, i.ciudad) AS name
      FROM inmueble i LEFT JOIN tipo_inmueble t ON t.id_tipo = i.id_tipo ORDER BY i.id_inmueble`,
    )
    const [availableProperties] = await pool.execute(
      `SELECT i.id_inmueble AS id, CONCAT_WS(' · ', t.nombre_tipo, i.direccion, i.ciudad) AS name
      FROM inmueble i LEFT JOIN tipo_inmueble t ON t.id_tipo = i.id_tipo
      JOIN estadosi e ON e.id_estado = i.id_estado
      WHERE e.nombre_estado = 'Disponible' ORDER BY i.id_inmueble`,
    )
    const [clients] = await pool.execute(
      `SELECT id_cliente AS id, CONCAT_WS(' ', nombre, apellido) AS name FROM clientes ORDER BY id_cliente`,
    )
    res.json({
      states: serializeRows(states),
      types: serializeRows(types),
      agents: serializeRows(agents),
      zones: serializeRows(zones),
      properties: serializeRows(properties),
      availableProperties: serializeRows(availableProperties),
      clients: serializeRows(clients),
    })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar las opciones de inmuebles.")
  }
})

app.get("/api/admin/properties", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        i.id_inmueble AS id,
        i.direccion AS address,
        i.ciudad AS district,
        i.metros2 AS area,
        i.habitaciones AS bedrooms,
        i.banos AS bathrooms,
        i.precio AS price,
        e.nombre_estado AS status,
        t.nombre_tipo AS category,
        (
          SELECT image.ruta_imagen
          FROM imagen_inmueble image
          WHERE image.id_inmueble = i.id_inmueble
          ORDER BY image.es_principal DESC, image.fecha_subida DESC
          LIMIT 1
        ) AS image_url,
        i.id_asesor AS agent_id,
        i.id_tipo AS type_id,
        i.id_zona AS zone_id,
        CONCAT_WS(' ', a.nombre, a.apellido) AS agent_name,
        a.telefono AS agent_phone,
        a.email AS agent_email
      FROM inmueble i
      LEFT JOIN estadosi e ON e.id_estado = i.id_estado
      LEFT JOIN tipo_inmueble t ON t.id_tipo = i.id_tipo
      LEFT JOIN asesores a ON a.id_asesor = i.id_asesor
      ORDER BY i.id_inmueble`,
    )
    res.json({ rows: serializeRows(rows) })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar los inmuebles.")
  }
})

app.get("/api/admin/properties/:propertyId/comments", async (req, res) => {
  const propertyId = Number(req.params.propertyId)
  if (!Number.isSafeInteger(propertyId) || propertyId < 1) {
    return res
      .status(400)
      .json({ error: "Identificador de inmueble inválido." })
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
        id_comentario AS id,
        id_inmueble AS property_id,
        autor AS author,
        texto AS text,
        es_muestra AS is_sample,
        visible_para_clientes AS visible,
        fecha_creacion AS created_at
      FROM comentario_inmueble
      WHERE id_inmueble = ?
      ORDER BY orden`,
      [propertyId],
    )
    res.json({
      open: rows.length > 0 && rows.every((row) => Boolean(row.visible)),
      comments: serializeRows(rows),
    })
  } catch (error) {
    sendDatabaseError(res, error, "No se pudieron cargar los comentarios.")
  }
})

app.patch("/api/admin/properties/:propertyId/comments", async (req, res) => {
  const propertyId = Number(req.params.propertyId)
  const { open } = req.body ?? {}
  if (
    !Number.isSafeInteger(propertyId) ||
    propertyId < 1 ||
    typeof open !== "boolean"
  ) {
    return res.status(400).json({ error: "Solicitud de comentarios inválida." })
  }

  try {
    const [result] = await pool.execute(
      `UPDATE comentario_inmueble
      SET visible_para_clientes = ?
      WHERE id_inmueble = ?`,
      [open, propertyId],
    )
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron comentarios para el inmueble." })
    }
    res.json({ open, updated: result.affectedRows })
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "No se pudo cambiar la visibilidad de los comentarios.",
    )
  }
})

app.get("/api/admin/tables", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT TABLE_NAME AS name
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_TYPE IN ('BASE TABLE', 'VIEW')
      ORDER BY TABLE_NAME`,

      [database],
    )

    res.json({ tables: rows.map((row) => row.name) })
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "No se pudieron consultar las tablas de la base de datos.",
    )
  }
})

app.get("/api/admin/tables/:table", async (req, res) => {
  const tableName = req.params.table

  try {
    const [rawColumns] = await pool.execute(
      `SELECT COLUMN_NAME AS name
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION`,

      [database, tableName],
    )

    if (rawColumns.length === 0) {
      return res.status(404).json({ error: "La tabla solicitada no existe." })
    }

    const columns =
      tableName === "app_usuario"
        ? rawColumns.filter((column) => column.name !== "clave_hash")
        : rawColumns
    const safeTableName = tableName.replaceAll("`", "``")

    const selectedColumns = columns
      .map((column) => `\`${column.name.replaceAll("`", "``")}\``)
      .join(", ")
    const [rows] = await pool.query(
      `SELECT ${selectedColumns} FROM \`${safeTableName}\``,
    )

    res.json({
      columns: columns.map((column) => column.name),

      rows: serializeRows(rows),
    })
  } catch (error) {
    sendDatabaseError(
      res,
      error,
      "No se pudieron cargar los registros de la tabla.",
    )
  }
})

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "")

  if (token) sessions.delete(token)

  res.status(204).end()
})

app.listen(port, "127.0.0.1", () => {
  console.log(`API local disponible en http://127.0.0.1:${port}`)

  if (!adminPassword) {
    console.warn(
      "Configura ADMIN_PASSWORD en .env antes de iniciar sesión como administrador.",
    )
  }
})

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await pool.end()

    process.exit(0)
  })
}
