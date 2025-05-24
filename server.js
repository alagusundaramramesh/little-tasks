const express = require('express');
const PDFDocument = require('pdfkit');
const moment = require('moment');

const app = express();
const PORT = 3020;
const cors = require('cors');
app.use(cors());


// Sample invoice data
const invoiceData = {
    invoiceNumber: 'INV-2025001',
    date: moment().format('YYYY-MM-DD'),
    customer: {
        name: 'John Doe',
        address: '1234 Elm Street, Springfield, USA',
        email: 'johndoe@example.com',
    },
    items: [
        { name: 'Laptop', quantity: 1, price: 1200 },
        { name: 'Wireless Mouse', quantity: 2, price: 25 },
        { name: 'USB-C Cable', quantity: 3, price: 15 },
    ],
    taxRate: 0.1, // 10% tax
};

// Route to generate invoice PDF
app.get('/invoice', (req, res) => {
    // Set response headers for PDF download
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // **Header Section**
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoiceNumber}`);
    doc.text(`Date: ${invoiceData.date}`);
    doc.moveDown();

    // **Customer Details**
    doc.fontSize(14).text('Bill To:', { underline: true });
    doc.fontSize(12).text(invoiceData.customer.name);
    doc.text(invoiceData.customer.address);
    doc.text(`Email: ${invoiceData.customer.email}`);
    doc.moveDown();

    // **Table Header**
    doc.fontSize(12).text('Item', 50, 250);
    doc.text('Quantity', 300, 250);
    doc.text('Price', 400, 250);
    doc.text('Total', 500, 250);
    doc.moveTo(50, 270).lineTo(550, 270).stroke(); // Draw line
    let yPosition = 280;

    // **Invoice Items**
    let totalAmount = 0;
    invoiceData.items.forEach((item) => {
        let itemTotal = item.quantity * item.price;
        totalAmount += itemTotal;
        doc.text(item.name, 50, yPosition);
        doc.text(item.quantity.toString(), 300, yPosition);
        doc.text(`$${item.price.toFixed(2)}`, 400, yPosition);
        doc.text(`$${itemTotal.toFixed(2)}`, 500, yPosition);
        yPosition += 20;
    });

    // **Subtotal & Tax**
    doc.moveTo(50, yPosition + 10).lineTo(550, yPosition + 10).stroke();
    doc.text('Subtotal:', 400, yPosition + 20);
    doc.text(`$${totalAmount.toFixed(2)}`, 500, yPosition + 20);
    doc.text(`Tax (${invoiceData.taxRate * 100}%):`, 400, yPosition + 40);
    let taxAmount = totalAmount * invoiceData.taxRate;
    doc.text(`$${taxAmount.toFixed(2)}`, 500, yPosition + 40);

    // **Total Amount**
    doc.fontSize(14).text('Total Amount:', 400, yPosition + 70, { bold: true });
    doc.text(`$${(totalAmount + taxAmount).toFixed(2)}`, 500, yPosition + 70);

    // **Footer**
    doc.moveDown().moveDown();
    doc.fontSize(12).text('Thank you for your business!', { align: 'center' });

    // End PDF document
    doc.end();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
