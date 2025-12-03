import { PDFDocument, PDFPage, StandardFonts, rgb } from 'pdf-lib'
import type { PDFFont, RGB } from 'pdf-lib'

export interface DrawTextOptions {
  x: number
  y: number
  text: string
  font?: PDFFont
  size?: number
  color?: RGB
  maxWidth?: number
}

export interface TableColumn {
  header: string
  width: number
  align?: 'left' | 'center' | 'right'
}

export interface TableRow {
  [key: string]: string | number
}

export abstract class PDFBuilderBase {
  protected pdfDoc!: PDFDocument
  protected regularFont!: PDFFont
  protected boldFont!: PDFFont
  protected currentPage!: PDFPage
  protected currentY: number = 0
  protected readonly pageWidth = 595
  protected readonly pageHeight = 842
  protected readonly margin = 50
  protected readonly contentWidth = this.pageWidth - 2 * this.margin
  protected readonly colors = {
    primary: rgb(0, 0, 0),
    secondary: rgb(0.2, 0.2, 0.2),
    text: rgb(0, 0, 0),
    textLight: rgb(0.4, 0.4, 0.4),
    border: rgb(0.7, 0.7, 0.7),
    background: rgb(0.95, 0.95, 0.95),
    success: rgb(0, 0, 0),
    warning: rgb(0, 0, 0),
    danger: rgb(0, 0, 0),
  }

  protected readonly fontSizes = {
    h1: 16,
    h2: 14,
    h3: 12,
    body: 10,
    small: 8,
  }

  abstract build(data: unknown): Promise<Uint8Array>

  protected async initialize() {
    this.pdfDoc = await PDFDocument.create()
    this.regularFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica)
    this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold)
    this.addPage()
  }

  protected addPage() {
    this.currentPage = this.pdfDoc.addPage([this.pageWidth, this.pageHeight])
    this.currentY = this.pageHeight - this.margin
  }

  protected checkPageSpace(requiredSpace: number) {
    if (this.currentY - requiredSpace < this.margin) {
      this.addPage()
    }
  }

  protected drawText(options: DrawTextOptions) {
    const {
      x,
      y,
      text,
      font = this.regularFont,
      size = this.fontSizes.body,
      color = this.colors.text,
      maxWidth,
    } = options

    if (maxWidth) {
      const lines = this.wrapText(text, font, size, maxWidth)
      lines.forEach((line, index) => {
        this.currentPage.drawText(line, {
          x,
          y: y - index * (size + 2),
          font,
          size,
          color,
        })
      })
      return lines.length * (size + 2)
    }

    this.currentPage.drawText(text, { x, y, font, size, color })
    return size + 2
  }

  protected wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, fontSize)

      if (width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  protected drawSectionTitle(title: string, color: RGB = this.colors.primary) {
    this.checkPageSpace(30)

    this.currentPage.drawRectangle({
      x: this.margin,
      y: this.currentY - 2,
      width: this.contentWidth,
      height: 2,
      color,
    })

    this.currentY -= 20

    this.drawText({
      x: this.margin,
      y: this.currentY,
      text: title,
      font: this.boldFont,
      size: this.fontSizes.h3,
      color,
    })

    this.currentY -= 10
  }

  protected drawDivider(color: RGB = this.colors.border) {
    this.checkPageSpace(10)
    this.currentY -= 5

    this.currentPage.drawRectangle({
      x: this.margin,
      y: this.currentY,
      width: this.contentWidth,
      height: 0.5,
      color,
    })

    this.currentY -= 10
  }

  protected drawBox(
    x: number,
    y: number,
    width: number,
    height: number,
    backgroundColor: RGB = this.colors.background,
    borderColor?: RGB,
  ) {
    this.currentPage.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: backgroundColor,
    })

    if (borderColor) {
      this.currentPage.drawRectangle({
        x,
        y: y - height,
        width,
        height,
        borderColor,
        borderWidth: 1,
      })
    }
  }

  protected drawTable(columns: TableColumn[], rows: TableRow[]) {
    const rowHeight = 20
    const headerHeight = 25
    const totalHeight = headerHeight + rows.length * rowHeight

    this.checkPageSpace(totalHeight + 20)

    let currentX = this.margin

    this.drawBox(this.margin, this.currentY, this.contentWidth, headerHeight, this.colors.primary)

    columns.forEach((column) => {
      this.drawText({
        x: currentX + 5,
        y: this.currentY - 17,
        text: column.header,
        font: this.boldFont,
        size: this.fontSizes.body,
        color: rgb(1, 1, 1),
      })
      currentX += column.width
    })

    this.currentY -= headerHeight

    rows.forEach((row, rowIndex) => {
      currentX = this.margin

      if (rowIndex % 2 === 0) {
        this.drawBox(
          this.margin,
          this.currentY,
          this.contentWidth,
          rowHeight,
          this.colors.background,
        )
      }

      columns.forEach((column) => {
        const cellValue = String(row[column.header] || '')
        const textWidth = this.regularFont.widthOfTextAtSize(cellValue, this.fontSizes.body)

        let textX = currentX + 5

        if (column.align === 'center') {
          textX = currentX + (column.width - textWidth) / 2
        } else if (column.align === 'right') {
          textX = currentX + column.width - textWidth - 5
        }

        this.drawText({
          x: textX,
          y: this.currentY - 15,
          text: cellValue,
          size: this.fontSizes.body,
        })

        currentX += column.width
      })

      this.currentPage.drawRectangle({
        x: this.margin,
        y: this.currentY - rowHeight,
        width: this.contentWidth,
        height: 0.5,
        color: this.colors.border,
      })

      this.currentY -= rowHeight
    })

    this.currentY -= 10
  }

  protected drawFooter(pageNumber: number, totalPages: number) {
    const footerY = this.margin - 20

    this.currentPage.drawText(`Página ${pageNumber} de ${totalPages}`, {
      x: this.pageWidth / 2 - 30,
      y: footerY,
      font: this.regularFont,
      size: this.fontSizes.small,
      color: this.colors.textLight,
    })

    this.currentPage.drawText(new Date().toLocaleDateString('pt-BR'), {
      x: this.pageWidth - this.margin - 60,
      y: footerY,
      font: this.regularFont,
      size: this.fontSizes.small,
      color: this.colors.textLight,
    })
  }

  protected async finalize(): Promise<Uint8Array> {
    return this.pdfDoc.save()
  }
}
