import dashboardModel from '../models/dashboardModel.js';
// import appError from '../utils/appError.js';
import { getDateRange } from '../utils/dateRange.js';
async function getDashboardData() {
    const todayRange = getDateRange('today');
    const from = todayRange.from;
    const to = todayRange.to;

    const itemsInStock = await dashboardModel.itemsInStock();

    const numberOfSales = await dashboardModel.numOfSales(from, to);
    const numOfAllSoldItems = await dashboardModel.numOfAllSoldItems(from, to);

    const top5SaleItems = await dashboardModel.top5SaleItems();
    return {
        itemInStock: itemsInStock,
        sales: {
            numberOfSales: numberOfSales,
            numOfAllSoldItems: numOfAllSoldItems,
        },
        top5SaleItems: top5SaleItems

    };
}

export default { getDashboardData }