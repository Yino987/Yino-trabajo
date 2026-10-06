import type { DatabaseContract } from "./databaseApi"
import { money } from "./format"

type ContractSections = {
  title: string
  parties: Array<{ label: string; value: string }>
  property: Array<{ label: string; value: string }>
  clauses: Array<{ title: string; text: string }>
  notices: string
}

function displayDate(value: string | null) {
  if (!value) return "No especificada"
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? String(value).slice(0, 10)
    : new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date)
}

function contractSections(contract: DatabaseContract): ContractSections {
  const isSale = contract.type === "venta"
  const counterparty = isSale ? "COMPRADOR(A)" : "ARRENDATARIO(A)"
  const operation = isSale ? "COMPRAVENTA" : "ARRENDAMIENTO"
  const amountLabel = isSale ? "Precio total" : "Renta pactada"
  const endDate = contract.end_date
    ? displayDate(contract.end_date)
    : "No especificada"

  return {
    title: `CONTRATO DE ${operation}`,
    parties: [
      { label: counterparty, value: contract.client },
      { label: "DNI / documento", value: "________________________________" },
      { label: "Domicilio", value: "________________________________" },
      { label: "Correo y teléfono", value: "________________________________" },
      {
        label: isSale ? "VENDEDOR(A)" : "ARRENDADOR(A)",
        value: "________________________________",
      },
      { label: "DNI / documento", value: "________________________________" },
      { label: "Domicilio", value: "________________________________" },
      { label: "Correo y teléfono", value: "________________________________" },
    ],
    property: [
      { label: "Inmueble", value: contract.property },
      { label: "Código en el sistema", value: `INM-${contract.property_id}` },
      { label: "Precio / renta", value: money(Number(contract.amount)) },
      { label: "Inicio", value: displayDate(contract.start_date) },
      { label: "Fin", value: endDate },
      { label: "Asesor registrado", value: contract.agent },
    ],
    clauses: [
      {
        title: "PRIMERA. OBJETO",
        text: `Las partes acuerdan celebrar una operación de ${operation.toLocaleLowerCase()} respecto del inmueble identificado en este documento. La identificación registral, linderos, cargas y demás datos que no consten aquí deberán verificarse y completarse antes de la firma.`,
      },
      {
        title: "SEGUNDA. PRECIO Y FORMA DE PAGO",
        text: `${amountLabel}: ${money(Number(contract.amount))}. Moneda, cronograma, medio de pago, cuenta receptora, adelantos, garantías y constancias: ________________________________________________. Estos términos deben ser acordados expresamente por las partes.`,
      },
      {
        title: "TERCERA. PLAZO Y ENTREGA",
        text: `Fecha de inicio registrada: ${displayDate(contract.start_date)}. Fecha de término registrada: ${endDate}. La fecha y condiciones de entrega, posesión, llaves e inventario serán: ________________________________________________. Si se trata de una compraventa, completar la fecha y forma de transferencia.`,
      },
      {
        title: "CUARTA. OBLIGACIONES DE LAS PARTES",
        text: `Cada parte declara que verificará su identidad, facultades y la información del inmueble. Las obligaciones específicas de mantenimiento, servicios, tributos, gastos notariales o registrales, reparaciones y demás responsabilidades deberán detallarse aquí: ________________________________________________.`,
      },
      {
        title: "QUINTA. INCUMPLIMIENTO Y TERMINACIÓN",
        text: `Las partes deberán establecer por escrito los plazos de subsanación, penalidades permitidas, causas de resolución y procedimiento aplicable: ________________________________________________. Ninguna condición no consignada en este documento se presume pactada.`,
      },
      {
        title: "SEXTA. NOTIFICACIONES Y SOLUCIÓN DE CONTROVERSIAS",
        text: `Domicilios y correos válidos para notificaciones: ________________________________________________. Lugar y mecanismo acordado para resolver controversias: ________________________________________________. Las partes deberán verificar la legislación aplicable y completar esta cláusula antes de firmar.`,
      },
      {
        title: "SÉPTIMA. ASESORÍA E INTERMEDIACIÓN",
        text: `El sistema registra a ${contract.agent} como asesor relacionado con la operación. La calidad, representación, obligaciones y remuneración de cada interviniente deberán confirmarse y documentarse por separado cuando corresponda.`,
      },
    ],
    notices:
      "BORRADOR PARA REVISIÓN: Este formato reúne únicamente los datos disponibles en el sistema y contiene espacios pendientes. No acredita propiedad, identidad, representación, pago ni inscripción. Antes de firmarlo, complete y verifique los datos y condiciones con las partes y solicite revisión legal/notarial conforme a la normativa aplicable.",
  }
}

function safeFilename(contract: DatabaseContract) {
  return `contrato-${contract.type}-${contract.id}`
}

export async function exportContractWord(contract: DatabaseContract) {
  const { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } =
    await import("docx")
  const sections = contractSections(contract)
  const children = [
    new Paragraph({
      text: "HUANCAYORK · GESTIÓN INMOBILIARIA",
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      run: { bold: true, color: "1D5742", size: 22 },
    }),
    new Paragraph({
      text: sections.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Contrato N.º ${contract.id}`, bold: true }),
        new TextRun("    ·    Documento generado para revisión"),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
    }),
    new Paragraph({
      text: "COMPARECEN",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      text: `De una parte, ${sections.parties[0].value}, cuyos demás datos de identidad y domicilio quedan pendientes de completar; y de otra parte, la persona propietaria o arrendadora del inmueble, cuyos datos también deberán incorporarse y verificarse. Ambas partes manifiestan que suscriben el presente documento bajo las cláusulas siguientes.`,
      spacing: { after: 180, line: 300 },
    }),
    new Paragraph({ text: "DATOS DE LAS PARTES", heading: HeadingLevel.HEADING_1 }),
    ...sections.parties.map(
      (item) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${item.label}: `, bold: true }),
            new TextRun(item.value),
          ],
          spacing: { after: 80 },
        }),
    ),
    new Paragraph({ text: "DATOS DE LA OPERACIÓN", heading: HeadingLevel.HEADING_1 }),
    ...sections.property.map(
      (item) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${item.label}: `, bold: true }),
            new TextRun(item.value),
          ],
          spacing: { after: 80 },
        }),
    ),
    new Paragraph({
      text: "CLÁUSULAS",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 220 },
    }),
    ...sections.clauses.flatMap((clause) => [
      new Paragraph({
        text: clause.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 160, after: 60 },
      }),
      new Paragraph({
        text: clause.text,
        spacing: { after: 140, line: 300 },
      }),
    ]),
    new Paragraph({
      text: "FIRMAS",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 260 },
    }),
    new Paragraph({
      text: "\n\n_______________________________                    _______________________________\nPARTE COMPRADORA / ARRENDATARIA                    PARTE VENDEDORA / ARRENDADORA\nNombre: __________________________                    Nombre: __________________________\nDocumento: _______________________                    Documento: _______________________",
      spacing: { after: 180, line: 300 },
    }),
    new Paragraph({
      text: "\n\n_______________________________\nAsesor registrado: " + contract.agent,
      spacing: { after: 220 },
    }),
    new Paragraph({
      children: [new TextRun({ text: sections.notices, bold: true, color: "8B3A32" })],
      spacing: { before: 200, line: 280 },
    }),
  ]

  const document = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Aptos", size: 21, color: "27332D" },
          paragraph: { spacing: { line: 280 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
          },
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(document)
  download(blob, `${safeFilename(contract)}.docx`)
}

export async function exportContractPdf(contract: DatabaseContract) {
  const { jsPDF } = await import("jspdf")
  const document = new jsPDF({ unit: "mm", format: "a4" })
  const sections = contractSections(contract)
  const pageWidth = document.internal.pageSize.getWidth()
  const pageHeight = document.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - margin * 2
  let y = 20

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - 18) {
      document.addPage()
      y = 20
    }
  }

  const paragraph = (
    text: string,
    options: { bold?: boolean; size?: number; color?: number[]; gap?: number } = {},
  ) => {
    const { bold = false, size = 10, color = [39, 51, 45], gap = 4 } = options
    document.setFont("helvetica", bold ? "bold" : "normal")
    document.setFontSize(size)
    document.setTextColor(color[0], color[1], color[2])
    const lines = document.splitTextToSize(text, contentWidth)
    ensureSpace(lines.length * (size * 0.42) + gap)
    document.text(lines, margin, y)
    y += lines.length * (size * 0.42) + gap
  }

  document.setFillColor(29, 87, 66)
  document.rect(0, 0, pageWidth, 8, "F")
  paragraph("HUANCAYORK · GESTIÓN INMOBILIARIA", {
    bold: true,
    size: 11,
    color: [29, 87, 66],
    gap: 3,
  })
  paragraph(sections.title, { bold: true, size: 18, gap: 3 })
  paragraph(`Contrato N.º ${contract.id} · Documento generado para revisión`, {
    size: 9,
    color: [100, 112, 105],
    gap: 8,
  })
  paragraph(
    `COMPARECEN: De una parte, ${sections.parties[0].value}, cuyos demás datos de identidad y domicilio quedan pendientes de completar; y de otra parte, la persona propietaria o arrendadora del inmueble, cuyos datos también deberán incorporarse y verificarse. Ambas partes manifiestan que suscriben el presente documento bajo las cláusulas siguientes.`,
    { size: 10, gap: 7 },
  )

  const sectionHeading = (title: string) => {
    ensureSpace(10)
    document.setDrawColor(214, 220, 215)
    document.line(margin, y, pageWidth - margin, y)
    y += 6
    paragraph(title, { bold: true, size: 11, color: [29, 87, 66], gap: 4 })
  }

  sectionHeading("DATOS DE LAS PARTES")
  sections.parties.forEach((item) =>
    paragraph(`${item.label}: ${item.value}`, { size: 9, gap: 2 }),
  )
  sectionHeading("DATOS DE LA OPERACIÓN")
  sections.property.forEach((item) =>
    paragraph(`${item.label}: ${item.value}`, { size: 9, gap: 2 }),
  )
  sectionHeading("CLÁUSULAS")
  sections.clauses.forEach((clause) => {
    paragraph(clause.title, { bold: true, size: 9, color: [29, 87, 66], gap: 2 })
    paragraph(clause.text, { size: 9, gap: 4 })
  })
  sectionHeading("FIRMAS")
  paragraph(
    "_______________________________                         _______________________________\nPARTE COMPRADORA / ARRENDATARIA                         PARTE VENDEDORA / ARRENDADORA\nNombre: __________________________                         Nombre: __________________________\nDocumento: _______________________                         Documento: _______________________",
    { size: 8, gap: 7 },
  )
  paragraph(`_______________________________\nAsesor registrado: ${contract.agent}`, {
    size: 9,
    gap: 7,
  })
  paragraph(sections.notices, {
    bold: true,
    size: 8,
    color: [139, 58, 50],
    gap: 2,
  })

  const pageCount = document.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page)
    document.setFont("helvetica", "normal")
    document.setFontSize(8)
    document.setTextColor(120, 128, 123)
    document.text(
      `Contrato ${contract.id} · Página ${page} de ${pageCount}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" },
    )
  }
  document.save(`${safeFilename(contract)}.pdf`)
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function getContractSections(contract: DatabaseContract) {
  return contractSections(contract)
}
