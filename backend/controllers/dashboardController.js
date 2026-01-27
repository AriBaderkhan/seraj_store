import dashboardService from '../services/dashboardService.js';
import asyncWrap from '../utils/asyncWrap.js';



export const getDashboardData = asyncWrap(async (req, res, next) => {
    const result = await dashboardService.getDashboardData();
    res.status(200).json({
        status: 'success status for dashboard',
        data: result
    })
})

export default { getDashboardData }
