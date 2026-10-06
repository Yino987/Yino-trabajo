CREATE TABLE IF NOT EXISTS comentario_inmueble (
    id_comentario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_inmueble INT NOT NULL,
    orden SMALLINT UNSIGNED NOT NULL,
    autor VARCHAR(80) NOT NULL DEFAULT 'Ejemplo',
    texto TEXT NOT NULL,
    es_muestra BOOLEAN NOT NULL DEFAULT TRUE,
    visible_para_clientes BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_comentario),
    UNIQUE KEY uq_comentario_inmueble_orden (id_inmueble, orden),
    CONSTRAINT fk_comentario_inmueble
        FOREIGN KEY (id_inmueble) REFERENCES inmueble (id_inmueble)
        ON DELETE CASCADE
);

INSERT INTO comentario_inmueble
    (id_inmueble, orden, autor, texto, es_muestra, visible_para_clientes)
SELECT
    inmueble.id_inmueble,
    muestras.orden,
    'Ejemplo',
    CASE muestras.orden
        WHEN 1 THEN 'Comentario de muestra: texto ilustrativo, pendiente de reemplazar por una opinión real autorizada.'
        ELSE 'Segundo comentario de muestra: contenido de demostración, no corresponde a una opinión de cliente real.'
    END,
    TRUE,
    TRUE
FROM inmueble
CROSS JOIN (
    SELECT 1 AS orden
    UNION ALL
    SELECT 2 AS orden
) AS muestras
LEFT JOIN comentario_inmueble existente
    ON existente.id_inmueble = inmueble.id_inmueble
    AND existente.orden = muestras.orden
WHERE existente.id_comentario IS NULL;
