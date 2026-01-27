import reportService from "../services/reportService.js";
import { buildMonthlyReportPdfBuffer } from "../src/pdf/buildMonthlyMonthlyPdf.js";
import asyncWrap from "../utils/asyncWrap.js";
import monthlyReporteDateRange from "../utils/reportDateRange.js";

const getMonthlyPDF = asyncWrap(async (req, res) => {
    const { month } = req.query;

    const dateRange = await monthlyReporteDateRange(month);

    const data = await reportService.serviceMonthlyReportPdf(dateRange);
    const pdfBuffer = await buildMonthlyReportPdfBuffer(data, dateRange);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="monthly-report-${month}.pdf"`);
    res.send(pdfBuffer);
});



export default { getMonthlyPDF }