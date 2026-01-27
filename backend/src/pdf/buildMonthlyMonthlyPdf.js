import PDFDocument from "pdfkit";

export function buildMonthlyReportPdfBuffer(data, dateRange) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        doc.on("error", (err) => {
            reject(err);
        });

        // --- Styling Constants ---
        const colors = {
            primary: "#2c3e50", // Dark Blue
            secondary: "#34495e", // Light Blue/Grey
            accent: "#e67e22", // Orange
            success: "#27ae60", // Green
            danger: "#c0392b", // Red
            text: "#333333",
            lightText: "#7f8c8d",
            background: "#f4f6f7",
        };

        // --- Helper Functions ---
        const drawSectionHeader = (text, y) => {
            doc
                .fontSize(14)
                .font("Helvetica-Bold")
                .fillColor(colors.primary)
                .text(text, 50, y);
            doc
                .moveTo(50, y + 20)
                .lineTo(550, y + 20)
                .strokeColor(colors.lightText)
                .lineWidth(0.5)
                .stroke();
        };

        const drawCard = (x, y, w, h, title, value, color = colors.primary) => {
            // Card Background
            doc
                .roundedRect(x, y, w, h, 5)
                .fillColor(colors.background)
                .fill();

            // Title
            doc
                .fontSize(10)
                .font("Helvetica")
                .fillColor(colors.lightText)
                .text(title, x + 10, y + 10, { width: w - 20, align: "left" });

            // Value
            doc
                .fontSize(18)
                .font("Helvetica-Bold")
                .fillColor(color)
                .text(String(value), x + 10, y + 35, { width: w - 20, align: "left" });
        };

        // --- Content Generation ---

        // 1. Header
        doc
            .fontSize(24)
            .font("Helvetica-Bold")
            .fillColor(colors.primary)
            .text(data.storeName || "Seraj Phone", 50, 50, { align: "center" });

        doc
            .fontSize(12)
            .font("Helvetica")
            .fillColor(colors.lightText)
            .text("Monthly Performance Report", 50, 80, { align: "center" });

        doc
            .fontSize(10)
            .text(`Period: ${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`, 50, 100, { align: "center" });

        let currentY = 140;

        // 2. Summary Metrics (Top Row)
        drawSectionHeader("Activity Overview", currentY);
        currentY += 40;

        const ticketW = 150;
        const ticketH = 70;
        const gap = 20;

        drawCard(50, currentY, ticketW, ticketH, "New Items Stocked", Number(data.itemsCameToStock), colors.primary);
        drawCard(50 + ticketW + gap, currentY, ticketW, ticketH, "Total Sales Count", Number(data.numberOfSales), colors.primary);
        drawCard(50 + (ticketW + gap) * 2, currentY, ticketW, ticketH, "Total Items Sold", Number(data.numOfAllSoldItems), colors.primary);

        currentY += ticketH + 30;

        // 3. Item Performance
        drawSectionHeader("Item Performance", currentY);
        currentY += 40;

        // Most Sold
        doc.rect(50, currentY, 240, 80).fillColor("#ecf0f1").fill();
        doc.fillColor(colors.text).fontSize(10).text("Most Sold Item", 60, currentY + 10);
        doc.fontSize(14).font("Helvetica-Bold").text(data.theMostSaleItem.item_name || "N/A", 60, currentY + 30, { width: 220 });
        doc.fontSize(12).font("Helvetica").fillColor(colors.success).text(`${data.theMostSaleItem.total_quantity || 0} units`, 60, currentY + 55);

        // Least Sold
        doc.rect(310, currentY, 240, 80).fillColor("#ecf0f1").fill();
        doc.fillColor(colors.text).fontSize(10).text("Least Sold Item", 320, currentY + 10);
        doc.fontSize(14).font("Helvetica-Bold").text(data.theLeastSaleItem.item_name || "N/A", 320, currentY + 30, { width: 220 });
        doc.fontSize(12).font("Helvetica").fillColor(colors.danger).text(`${data.theLeastSaleItem.total_quantity || 0} units`, 320, currentY + 55);

        currentY += 100;

        // 4. Financials
        drawSectionHeader("Financial Overview", currentY);
        currentY += 40;

        const rowHeight = 30;
        const colWidth = 200;
        const startX = 50;

        const drawRow = (label, value, isBold = false, color = colors.text) => {
            doc.font(isBold ? "Helvetica-Bold" : "Helvetica").fontSize(12).fillColor(color);
            doc.text(label, startX, currentY);
            doc.text(Number(value).toLocaleString() + " IQD", startX + colWidth, currentY, { align: "right", width: 200 });

            // dotted line
            doc.save()
                .moveTo(startX, currentY + 20)
                .lineTo(startX + colWidth + 200, currentY + 20)
                .dash(2, { space: 2 })
                .strokeColor("#bdc3c7")
                .stroke();
            doc.restore();

            currentY += rowHeight;
        };

        drawRow("Total Revenue", data.totalRevenues, true, colors.primary);
        drawRow("Cost of Goods Sold (COGS)", data.totalCogs, false, colors.danger);
        drawRow("Operating Expenses", data.totalExpenses, false, colors.danger);

        currentY += 10;
        doc.moveTo(startX, currentY).lineTo(startX + colWidth + 200, currentY).lineWidth(2).strokeColor(colors.primary).stroke();
        currentY += 20;

        // Net Result
        const isProfit = data.profit > 0;
        const netLabel = isProfit ? "NET PROFIT" : "NET LOSS";
        const netValue = isProfit ? data.profit : data.loss; // profit is positive, loss is negative in logic? Report Service says: if totalAll > 0 profit = totalAll, else loss = totalAll (so loss could be negative)
        // Actually reportService assigns the signed value to loss if it's <= 0.
        // If loss is -500, we typically display "Loss: 500". 
        // Let's check reportService logic again from context.
        // if (totalAll > 0) { profit = totalAll } else { loss = totalAll }
        // So if totalAll is -100, loss is -100.

        const displayValue = isProfit ? data.profit : Math.abs(data.loss);
        const netColor = isProfit ? colors.success : colors.danger;

        doc.rect(startX, currentY, colWidth + 200, 50).fillColor(isProfit ? "#eaffea" : "#ffeaea").fill();
        doc.fillColor(netColor).fontSize(16).font("Helvetica-Bold").text(netLabel, startX + 20, currentY + 15);
        doc.text(Number(displayValue).toLocaleString() + " IQD", startX + colWidth, currentY + 15, { align: "right", width: 200 });


        // Footer
        const pageHeight = 841.89; // A4 height
        doc
            .fontSize(8)
            .fillColor(colors.lightText)
            .text("Generated by Seraj Store System", 50, pageHeight - 40, { align: "center", width: 500 });

        doc.end();
    });
}
