import reportModel from '../models/reportModel.js';

async function serviceMonthlyReportPdf(dateRange) {
    const { from, to } = dateRange;

    const test = await reportModel.test1();
    console.log(test);
    const itemsCameToStock = await reportModel.itemsCameToStock(from, to);

    const numberOfSales = await reportModel.numOfSales(from, to);
    const numOfAllSoldItems = await reportModel.numOfAllSoldItems(from, to);

    const theMostSaleItem = await reportModel.theMostSaleItem(from, to);
    const theLeastSaleItem = await reportModel.theLeastSaleItem(from, to);


    const totalExpenses = await reportModel.totalExpenses(from, to);

    const totalRevenues = await reportModel.totalRevenues(from, to);

    const cogsForNonePhone = await reportModel.CogsForNonePhone(from, to);
    const cogsForPhone = await reportModel.CogsForPhone(from, to);
    const totalCogs = Number(cogsForNonePhone.cogs_non_phone) + Number(cogsForPhone.cogs_phone);

    const totalAll = Number(totalRevenues.total_revenues) - Number(totalCogs) - Number(totalExpenses.total_expenses);
    let profit;
    let loss;
    if (totalAll > 0) {
        profit = totalAll;
    } else {
        loss = totalAll;
    }
    return {
        storeName: "Seraj Phone",

        itemsCameToStock: Number(itemsCameToStock?.items_came_to_stock || 0),
        numberOfSales: Number(numberOfSales?.number_of_sales || 0),
        numOfAllSoldItems: Number(numOfAllSoldItems?.num_of_all_sold_items || 0),
        theMostSaleItem: theMostSaleItem,
        theLeastSaleItem: theLeastSaleItem,
        totalExpenses: Number(totalExpenses?.total_expenses || 0),
        totalRevenues: Number(totalRevenues?.total_revenues || 0),
        totalCogs: Number(totalCogs || 0),

        profit: Number(profit || 0),
        loss: Number(loss || 0)
    }
}


export default {
    serviceMonthlyReportPdf
}