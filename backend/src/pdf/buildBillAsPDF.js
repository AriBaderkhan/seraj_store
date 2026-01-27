import PDFDocument from 'pdfkit';

export const buildBillAsPDF = (data) => {
    return new Promise((resolve, reject) => {
        // Create a document with 80mm width (approx 226 points)
        const doc = new PDFDocument({
            size: [226, 800], // Height is arbitrary auto-expand, but we start with something long enough
            margins: { top: 10, bottom: 10, left: 10, right: 10 },
            autoFirstPage: true
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // -- HELPER FUNCTIONS --
        const drawLine = (y) => {
            doc.moveTo(10, y).lineTo(216, y).stroke();
        };

        let y = 10;

        // 1. Store Header
        doc.font('Helvetica-Bold').fontSize(14).text(data.store.name, { align: 'center' });
        doc.moveDown(0.2);

        // 2. Address
        doc.font('Helvetica').fontSize(9).text(data.store.address, { align: 'center' });
        doc.moveDown(0.5);

        // 3. Sale Info
        const dateOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Baghdad' // Adjusting to User's likely timezone (UTC+3)
        };
        const formattedDate = new Date(data.saleDate).toLocaleString('en-GB', dateOptions);

        doc.fontSize(9).text(`Date: ${formattedDate}`, { align: 'left' });
        doc.text(`Customer: ${data.customerName}`, { align: 'left' });
        doc.moveDown(0.5);

        // Divider
        y = doc.y;
        drawLine(y);
        y += 5;
        doc.y = y;

        // 4. Items Header
        // Columns: Item (10), Qty (180) - Right Aligned
        doc.font('Helvetica-Bold').fontSize(9);
        doc.text('Item', 10, y, { width: 160 });
        doc.text('Q', 170, y, { width: 30, align: 'center' }); // Adjusted for removal of Price column

        doc.moveDown(0.5);
        y = doc.y;
        drawLine(y);
        y += 5;
        doc.y = y;

        // 5. Items List
        doc.font('Helvetica').fontSize(9);

        data.items.forEach(item => {
            const currentY = doc.y;

            // Item Name (Wrap if needed)
            doc.text(item.item_name || 'Item', 10, currentY, { width: 160 });

            // Qty
            doc.text(item.quantity.toString(), 170, currentY, { width: 30, align: 'center' });

            // Move down for next item
            doc.moveDown(0.5);
        });

        y = doc.y;
        drawLine(y);
        y += 5;
        doc.y = y;

        // 6. Totals - ONLY PAID
        doc.font('Helvetica-Bold').fontSize(11);
        // doc.text('Total:', 10, y);
        // doc.text(`$${Number(data.total).toLocaleString()}`, 100, y, { align: 'right', width: 116 });

        // doc.moveDown(0.2);
        // doc.font('Helvetica').fontSize(9);
        doc.text('Total Paid:', 10, doc.y);
        doc.text(`$${Number(data.totalPaid).toLocaleString()}`, 100, doc.y - 11, { align: 'right', width: 116 });

        doc.moveDown(1);

        // 7. Warranty Notes
        const warrantyItems = data.items.filter(i => i.warranty_end_date);
        if (warrantyItems.length > 0) {
            doc.font('Helvetica-Oblique').fontSize(8);
            warrantyItems.forEach(i => {
                doc.text(`* Warranty for ${i.item_name} ends: ${new Date(i.warranty_end_date).toLocaleDateString()}`);
            });
            doc.moveDown(1);
        }

        // 8. Footer (Explicit Center Width)
        doc.font('Helvetica-Bold').fontSize(9);
        doc.text('Thank you for shopping!', 10, doc.y, { align: 'center', width: 206 });
        doc.font('Helvetica').fontSize(8);
        doc.text('Welcome to our store', 10, doc.y, { align: 'center', width: 206 });

        doc.end();
    });
};
