import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { getPaymentStatusLabel, formatInstallments as formatInstallmentsShared } from '@/shared/lib/labels'
import { PDFBuilderBase } from './pdf-builder.base'
import type { FinancialReportData } from '../types/financial-report.types'

export class FinancialReportBuilder extends PDFBuilderBase {
  async build(data: FinancialReportData, bannerUrl?: string): Promise<Uint8Array> {
    await this.initialize()

    await this.drawHeader(data, bannerUrl)
    this.drawEventSummary(data)
    this.drawClientData(data)
    this.drawFinancialSummary(data)

    if (data.payments.length > 0) {
      this.drawPaymentSchedule(data)
    }

    if (data.services.length > 0) {
      this.drawServicesTable(data)
    }

    if (data.orders.length > 0) {
      this.drawOrdersSection(data)
    }

    const totalPages = this.pdfDoc.getPageCount()
    this.pdfDoc.getPages().forEach((page, index) => {
      this.currentPage = page
      this.drawFooter(index + 1, totalPages)
    })

    return this.finalize()
  }

  private async drawHeader(data: FinancialReportData, bannerUrl?: string) {
    if (bannerUrl) {
      try {
        const bannerResponse = await fetch(bannerUrl)

        const bannerArrayBuffer = await bannerResponse.arrayBuffer()

        const contentType = bannerResponse.headers.get('content-type')?.toLowerCase() ?? ''
        const bannerBytes = new Uint8Array(bannerArrayBuffer)
        const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]
        const isPngSignature = pngSignature.every((byte, index) => bannerBytes[index] === byte)
        const isJpegSignature = bannerBytes[0] === 0xff && bannerBytes[1] === 0xd8

        const formatFromHeaders = contentType.includes('png')
          ? 'png'
          : contentType.includes('jpeg') || contentType.includes('jpg')
            ? 'jpg'
            : null

        const formatFromSignature = isPngSignature ? 'png' : isJpegSignature ? 'jpg' : null
        const formatFromExtension = bannerUrl.toLowerCase().endsWith('.png')
          ? 'png'
          : bannerUrl.toLowerCase().endsWith('.jpg') || bannerUrl.toLowerCase().endsWith('.jpeg')
            ? 'jpg'
            : null

        const imageFormat = formatFromHeaders ?? formatFromSignature ?? formatFromExtension ?? 'png'

        const bannerImage =
          imageFormat === 'png'
            ? await this.pdfDoc.embedPng(bannerArrayBuffer)
            : await this.pdfDoc.embedJpg(bannerArrayBuffer)

        const bannerHeight = 80
        const bannerWidth = this.contentWidth
        const aspectRatio = bannerImage.width / bannerImage.height
        const adjustedWidth = Math.min(bannerWidth, bannerHeight * aspectRatio)
        const adjustedHeight = adjustedWidth / aspectRatio

        this.currentPage.drawImage(bannerImage, {
          x: this.margin,
          y: this.currentY - adjustedHeight,
          width: adjustedWidth,
          height: adjustedHeight,
        })

        this.currentY -= adjustedHeight + 20
      } catch {
      }
    }

    this.drawText({
      x: this.margin,
      y: this.currentY,
      text: 'RELATÓRIO FINANCEIRO DE EVENTO',
      font: this.boldFont,
      size: this.fontSizes.h1,
    })

    this.currentY -= 20

    const contractLines = this.wrapText(
      data.event.contractName,
      this.boldFont,
      this.fontSizes.h2,
      this.contentWidth,
    )

    contractLines.forEach((line, index) => {
      this.drawText({
        x: this.margin,
        y: this.currentY - index * (this.fontSizes.h2 + 2),
        text: line,
        font: this.boldFont,
        size: this.fontSizes.h2,
      })
    })

    this.currentY -= contractLines.length * (this.fontSizes.h2 + 2) + 15
  }

  private drawEventSummary(data: FinancialReportData) {
    this.drawSectionTitle('Resumo do evento')
    this.currentY -= 5

    this.drawText({
      x: this.margin,
      y: this.currentY,
      text: `Período: ${this.formatOptionalDate(data.event.startDate)} a ${this.formatOptionalDate(data.event.endDate)}`,
      size: this.fontSizes.body,
    })

    this.currentY -= 15

    this.drawText({
      x: this.margin,
      y: this.currentY,
      text: `Parcelamento: ${this.formatInstallments(data.event.installments, data.event.installmentFrequency)}`,
      size: this.fontSizes.body,
    })

    this.currentY -= 15

    this.drawText({
      x: this.margin,
      y: this.currentY,
      text: `Valor Total: ${formatCurrency(data.event.totalValue)}`,
      font: this.boldFont,
      size: this.fontSizes.h2,
    })

    this.currentY -= 25
  }

  private drawClientData(data: FinancialReportData) {
    this.drawSectionTitle('Dados do cliente')
    this.currentY -= 10

    const infoItems = [
      { label: 'Cliente', value: data.client.name },
      { label: 'Documento', value: data.client.document },
      { label: 'Contrato', value: data.client.contractName },
    ]

    infoItems.forEach((item) => {
      this.checkPageSpace(20)

      this.drawText({
        x: this.margin,
        y: this.currentY,
        text: `${item.label}:`,
        font: this.boldFont,
        size: this.fontSizes.body,
      })

      this.drawText({
        x: this.margin + 100,
        y: this.currentY,
        text: item.value,
        size: this.fontSizes.body,
      })

      this.currentY -= 18
    })

    this.currentY -= 10
  }

  private drawFinancialSummary(data: FinancialReportData) {
    this.drawSectionTitle('Resumo financeiro')
    this.currentY -= 5

    this.drawText({
      x: this.margin,
      y: this.currentY,
      text: `Valor Pago: ${formatCurrency(data.summary.paidValue)}`,
      size: this.fontSizes.body,
    })

    this.currentY -= 15

    this.drawText({
      x: this.margin,
      y: this.currentY,
      text: `Valor Pendente: ${formatCurrency(data.summary.pendingValue)}`,
      size: this.fontSizes.body,
    })

    this.currentY -= 15

    this.drawText({
      x: this.margin,
      y: this.currentY,
      text: `Valor Vencido: ${formatCurrency(data.summary.overdueValue)}`,
      size: this.fontSizes.body,
    })

    this.currentY -= 20
  }

  private drawPaymentSchedule(data: FinancialReportData) {
    this.drawSectionTitle('Cronograma de pagamentos')
    this.currentY -= 10

    const columns = [
      { header: 'Parcela', width: 80, align: 'center' as const },
      { header: 'Vencimento', width: 120, align: 'center' as const },
      { header: 'Valor', width: 120, align: 'right' as const },
      { header: 'Status', width: 175, align: 'center' as const },
    ]

    const rows = data.payments.map((payment) => ({
      Parcela: `${payment.installmentNumber}/${data.payments.length}`,
      Vencimento: this.formatOptionalDate(payment.dueDate),
      Valor: formatCurrency(payment.amount),
      Status: this.formatStatus(payment.status),
    }))

    this.drawTable(columns, rows)
  }

  private drawServicesTable(data: FinancialReportData) {
    this.drawSectionTitle('Serviços contratados')
    this.currentY -= 10

    const columns = [
      { header: 'Serviço', width: 150 },
      { header: 'Qtd', width: 50, align: 'center' as const },
      { header: 'Diárias', width: 60, align: 'center' as const },
      { header: 'Valor Unit.', width: 90, align: 'right' as const },
      { header: 'Valor Total', width: 145, align: 'right' as const },
    ]

    const rows = data.services.map((service) => ({
      Serviço: service.name,
      Qtd: service.quantity.toString(),
      Diárias: service.dailyRate.toString(),
      'Valor Unit.': formatCurrency(service.unitValue),
      'Valor Total': formatCurrency(service.totalValue),
    }))

    this.drawTable(columns, rows)

    const total = data.services.reduce((sum, s) => sum + s.totalValue, 0)
    this.drawText({
      x: this.pageWidth - this.margin - 145,
      y: this.currentY - 15,
      text: `Total: ${formatCurrency(total)}`,
      font: this.boldFont,
      size: this.fontSizes.body,
      color: this.colors.primary,
    })

    this.currentY -= 30
  }

  private drawOrdersSection(data: FinancialReportData) {
    data.orders.forEach((order) => {
      this.checkPageSpace(150)

      this.drawSectionTitle(
        `Ordem de fornecimento ${order.orderNumber}`,
        order.status === 'cancelled' ? this.colors.danger : this.colors.primary,
      )

      this.currentY -= 5

      const orderInfo = [
        `Status: ${order.status === 'cancelled' ? 'CANCELADA' : 'ATIVA'}`,
        `Data de Criação: ${this.formatOptionalDate(order.createdAt)}`,
      ]

      orderInfo.forEach((info) => {
        this.drawText({
          x: this.margin,
          y: this.currentY,
          text: info,
          size: this.fontSizes.small,
          color: this.colors.textLight,
        })
        this.currentY -= 15
      })

      if (order.items.length > 0) {
        const columns = [
          { header: 'Descrição', width: 150 },
          { header: 'Qtd', width: 50, align: 'center' as const },
          { header: 'Diárias', width: 60, align: 'center' as const },
          { header: 'Valor Unit.', width: 90, align: 'right' as const },
          { header: 'Valor Total', width: 145, align: 'right' as const },
        ]

        const rows = order.items.map((item) => ({
          Descrição: item.description,
          Qtd: item.quantity.toString(),
          Diárias: item.dailyRate.toString(),
          'Valor Unit.': formatCurrency(item.unitValue),
          'Valor Total': formatCurrency(item.totalValue),
        }))

        this.drawTable(columns, rows)

        if (order.status !== 'cancelled') {
          this.drawText({
            x: this.pageWidth - this.margin - 145,
            y: this.currentY - 15,
            text: `Total: ${formatCurrency(order.totalValue)}`,
            font: this.boldFont,
            size: this.fontSizes.body,
            color: this.colors.primary,
          })
        } else {
          this.drawText({
            x: this.pageWidth - this.margin - 145,
            y: this.currentY - 15,
            text: 'Total: (Cancelada)',
            font: this.boldFont,
            size: this.fontSizes.body,
            color: this.colors.danger,
          })
        }
      }

      this.currentY -= 30
    })
  }

  private formatOptionalDate(date?: string | null): string {
    if (!date || date === '-') {
      return '-'
    }
    return formatDate(date)
  }

  private formatInstallments(quantity: number, frequency: string): string {
    return formatInstallmentsShared(quantity, frequency)
  }

  private formatStatus(status: string): string {
    return getPaymentStatusLabel(status)
  }
}
