CREATE TABLE IF NOT EXISTS app_usuario (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  correo VARCHAR(100) NOT NULL,
  clave_hash VARCHAR(255) NOT NULL,
  rol ENUM('cliente', 'agente') NOT NULL,
  id_cliente INT NULL,
  id_asesor INT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_app_usuario_correo (correo),
  UNIQUE KEY uq_app_usuario_cliente (id_cliente),
  UNIQUE KEY uq_app_usuario_asesor (id_asesor),
  CONSTRAINT fk_app_usuario_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente),
  CONSTRAINT fk_app_usuario_asesor
    FOREIGN KEY (id_asesor) REFERENCES asesores (id_asesor),
  CONSTRAINT chk_app_usuario_rol
    CHECK (
      (rol = 'cliente' AND id_cliente IS NOT NULL AND id_asesor IS NULL)
      OR
      (rol = 'agente' AND id_asesor IS NOT NULL AND id_cliente IS NULL)
    )
);

ALTER TABLE visitant
  ADD COLUMN estado ENUM(
    'Programada',
    'Confirmada',
    'Realizada',
    'Cancelada'
  ) NOT NULL DEFAULT 'Programada';
