import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import { uploadToS3 } from './s3'

interface VoucherData {
  bookingRef: string
  guestName: string
  packageName: string
  location: string
  arrivalDate: string
  departureDate: string
  guestsCount: number
  roomType: string
}

interface ReceiptData {
  receiptNo: string
  bookingRef: string
  guestName: string
  packageName: string
  amount: number
  paymentMethod: string
  transactionId: string
  nightsCount: number
  pricePerNight: number
}

export async function generateBookingVoucher(data: VoucherData): Promise<{ buffer: Buffer; url: string }> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 Size
  const { width, height } = page.getSize()

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Header Title
  page.drawText('INDIAN YOGA TOURISM', {
    x: 50,
    y: height - 60,
    size: 24,
    font: helveticaBold,
    color: rgb(0.004, 0.176, 0.114), // #012d1d
  })

  page.drawText('BOOKING VOUCHER', {
    x: 50,
    y: height - 85,
    size: 14,
    font: helveticaFont,
    color: rgb(0.173, 0.412, 0.306), // #2c694e
  })

  // Gold Line
  page.drawLine({
    start: { x: 50, y: height - 95 },
    end: { x: width - 50, y: height - 95 },
    thickness: 2,
    color: rgb(0.965, 0.745, 0.224), // #f6be39
  })

  // Confirmed Stamp
  page.drawText('CONFIRMED', {
    x: width - 180,
    y: height - 80,
    size: 26,
    font: helveticaBold,
    color: rgb(0.173, 0.412, 0.306),
    rotate: degrees(15),
    opacity: 0.8,
  })

  // Details
  let yPos = height - 150
  const drawRow = (label: string, value: string) => {
    page.drawText(label, { x: 50, y: yPos, size: 12, font: helveticaBold, color: rgb(0.25, 0.28, 0.26) })
    page.drawText(value, { x: 180, y: yPos, size: 12, font: helveticaFont, color: rgb(0.1, 0.1, 0.18) })
    yPos -= 30
  }

  drawRow('Booking Reference:', data.bookingRef)
  drawRow('Guest Name:', data.guestName)
  drawRow('Retreat package:', data.packageName)
  drawRow('Location:', data.location)
  drawRow('Arrival Date:', data.arrivalDate)
  drawRow('Departure Date:', data.departureDate)
  drawRow('No. of Guests:', String(data.guestsCount))
  drawRow('Room Type:', data.roomType.toUpperCase())

  // Divider
  page.drawLine({
    start: { x: 50, y: yPos - 10 },
    end: { x: width - 50, y: yPos - 10 },
    thickness: 1,
    color: rgb(0.75, 0.78, 0.76),
  })

  // Generate QR Code
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/${data.bookingRef}/confirmed`
  const qrDataUrl = await QRCode.toDataURL(qrUrl)
  const qrBase64 = qrDataUrl.split(',')[1]
  const qrPngBytes = Buffer.from(qrBase64, 'base64')
  const qrImage = await pdfDoc.embedPng(new Uint8Array(qrPngBytes))

  page.drawImage(qrImage, {
    x: width / 2 - 60,
    y: yPos - 160,
    width: 120,
    height: 120,
  })

  page.drawText('Scan to verify booking confirmation online', {
    x: width / 2 - 110,
    y: yPos - 180,
    size: 10,
    font: helveticaFont,
    color: rgb(0.44, 0.47, 0.45),
  })

  // Footer
  page.drawText('Present this voucher on arrival at the sanctuary desk.', {
    x: 50,
    y: 80,
    size: 11,
    font: helveticaBold,
    color: rgb(0.004, 0.176, 0.114),
  })

  page.drawText('Cloud 9 Tower, Vaishali Sec-1, Ghaziabad, UP 201010 | info@indianyogatourism.com', {
    x: 50,
    y: 60,
    size: 9,
    font: helveticaFont,
    color: rgb(0.44, 0.47, 0.45),
  })

  const pdfBytes = await pdfDoc.save()
  const buffer = Buffer.from(pdfBytes)

  const s3Key = `documents/${data.bookingRef}/voucher.pdf`
  const url = await uploadToS3(s3Key, buffer, 'application/pdf')

  return { buffer, url }
}

export async function generatePaymentReceipt(data: ReceiptData): Promise<{ buffer: Buffer; url: string }> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const { width, height } = page.getSize()

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Header Title
  page.drawText('INDIAN YOGA TOURISM', {
    x: 50,
    y: height - 60,
    size: 24,
    font: helveticaBold,
    color: rgb(0.004, 0.176, 0.114), // #012d1d
  })

  page.drawText('PAYMENT RECEIPT', {
    x: 50,
    y: height - 85,
    size: 14,
    font: helveticaFont,
    color: rgb(0.173, 0.412, 0.306),
  })

  // Gold Line
  page.drawLine({
    start: { x: 50, y: height - 95 },
    end: { x: width - 50, y: height - 95 },
    thickness: 2,
    color: rgb(0.965, 0.745, 0.224),
  })

  // Receipt meta
  page.drawText(`Receipt No: ${data.receiptNo}`, { x: 50, y: height - 130, size: 11, font: helveticaFont, color: rgb(0.44, 0.47, 0.45) })
  page.drawText(`Date: ${new Date().toLocaleDateString('en-US')}`, { x: width - 150, y: height - 130, size: 11, font: helveticaFont, color: rgb(0.44, 0.47, 0.45) })
  page.drawText(`Booking Ref: ${data.bookingRef}`, { x: 50, y: height - 150, size: 11, font: helveticaFont, color: rgb(0.44, 0.47, 0.45) })

  // Customer info
  page.drawText('Paid By:', { x: 50, y: height - 190, size: 12, font: helveticaBold, color: rgb(0.004, 0.176, 0.114) })
  page.drawText(data.guestName, { x: 50, y: height - 210, size: 12, font: helveticaFont, color: rgb(0.1, 0.1, 0.18) })

  // Table Headers
  let tableY = height - 260
  page.drawText('Description', { x: 50, y: tableY, size: 11, font: helveticaBold, color: rgb(0.004, 0.176, 0.114) })
  page.drawText('Amount', { x: width - 120, y: tableY, size: 11, font: helveticaBold, color: rgb(0.004, 0.176, 0.114) })

  page.drawLine({ start: { x: 50, y: tableY - 10 }, end: { x: width - 50, y: tableY - 10 }, thickness: 1, color: rgb(0.004, 0.176, 0.114) })

  // Table Content
  tableY -= 35
  page.drawText(`${data.packageName} Retreat`, { x: 50, y: tableY, size: 11, font: helveticaFont, color: rgb(0.1, 0.1, 0.18) })
  const basePrice = data.amount / 1.1 // Excluding 10% tax
  page.drawText(`$${basePrice.toFixed(2)}`, { x: width - 120, y: tableY, size: 11, font: helveticaFont, color: rgb(0.1, 0.1, 0.18) })

  tableY -= 20
  page.drawText(`${data.nightsCount} Nights Stay`, { x: 70, y: tableY, size: 10, font: helveticaFont, color: rgb(0.44, 0.47, 0.45) })

  tableY -= 30
  page.drawLine({ start: { x: 50, y: tableY }, end: { x: width - 50, y: tableY }, thickness: 0.5, color: rgb(0.75, 0.78, 0.76) })

  // Calculations
  tableY -= 25
  page.drawText('Subtotal:', { x: width - 200, y: tableY, size: 10, font: helveticaFont, color: rgb(0.44, 0.47, 0.45) })
  page.drawText(`$${basePrice.toFixed(2)}`, { x: width - 120, y: tableY, size: 10, font: helveticaFont, color: rgb(0.1, 0.1, 0.18) })

  tableY -= 20
  page.drawText('Taxes (10%):', { x: width - 200, y: tableY, size: 10, font: helveticaFont, color: rgb(0.44, 0.47, 0.45) })
  page.drawText(`$${(data.amount - basePrice).toFixed(2)}`, { x: width - 120, y: tableY, size: 10, font: helveticaFont, color: rgb(0.1, 0.1, 0.18) })

  tableY -= 25
  page.drawLine({ start: { x: width - 200, y: tableY }, end: { x: width - 50, y: tableY }, thickness: 1, color: rgb(0.004, 0.176, 0.114) })

  tableY -= 25
  page.drawText('Total Paid:', { x: width - 200, y: tableY, size: 12, font: helveticaBold, color: rgb(0.004, 0.176, 0.114) })
  page.drawText(`$${data.amount.toFixed(2)}`, { x: width - 120, y: tableY, size: 12, font: helveticaBold, color: rgb(0.004, 0.176, 0.114) })

  // Payment Details
  tableY -= 60
  page.drawText('Payment Method:', { x: 50, y: tableY, size: 11, font: helveticaBold, color: rgb(0.25, 0.28, 0.26) })
  page.drawText(data.paymentMethod.toUpperCase(), { x: 180, y: tableY, size: 11, font: helveticaFont, color: rgb(0.1, 0.1, 0.18) })

  tableY -= 25
  page.drawText('Transaction ID:', { x: 50, y: tableY, size: 11, font: helveticaBold, color: rgb(0.25, 0.28, 0.26) })
  page.drawText(data.transactionId || 'N/A', { x: 180, y: tableY, size: 11, font: helveticaFont, color: rgb(0.1, 0.1, 0.18) })

  // Note
  tableY -= 60
  page.drawText('Thank you for choosing Indian Yoga Tourism 🙏', {
    x: 50,
    y: tableY,
    size: 12,
    font: helveticaBold,
    color: rgb(0.173, 0.412, 0.306),
  })

  const pdfBytes = await pdfDoc.save()
  const buffer = Buffer.from(pdfBytes)

  const s3Key = `documents/${data.bookingRef}/receipt.pdf`
  const url = await uploadToS3(s3Key, buffer, 'application/pdf')

  return { buffer, url }
}
