import React from 'react';
import useDashboard from '../hooks/useDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaShoppingCart, FaBoxOpen, FaTrophy } from 'react-icons/fa';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { dashboardData, loading, error } = useDashboard();

    // Data processing
    const salesCount = dashboardData?.sales?.numberOfSales?.number_of_sales || 0;
    const soldItemsTotal = dashboardData?.sales?.numOfAllSoldItems?.number_of_sold_items || 0;
    const stockCount = dashboardData?.itemInStock?.total_quantity || 0;

    // Process chart data - ensure quantity is a number
    const chartData = (dashboardData?.top5SaleItems || []).map(item => ({
        name: item.item_name,
        quantity: parseInt(item.total_quantity, 10) || 0
    }));

    // Chart colors
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="loader">Loading Dashboard...</div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading dashboard data. Please try again later.</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Dashboard Overview</h2>
            </div>

            {/* Stats Boxes */}
            <div className="dashboard-grid">
                {/* Sales Box */}
                <div className="stat-card">
                    <div className="stat-icon sales">
                        <FaShoppingCart />
                    </div>
                    <div className="stat-content">
                        <p>Total Sales Transactions</p>
                        <h3>{salesCount}</h3>
                        <p className="sub-stat">Total Items Sold: {soldItemsTotal}</p>
                    </div>
                </div>

                {/* Stock Box */}
                <div className="stat-card">
                    <div className="stat-icon stock">
                        <FaBoxOpen />
                    </div>
                    <div className="stat-content">
                        <p>Total Items in Stock</p>
                        <h3>{stockCount}</h3>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="chart-container">
                <div className="chart-header">
                    <FaTrophy />
                    <span>Top 5 Selling Items</span>
                </div>
                <div className="chart-body">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="6 6" vertical={false} />
                            {/* vertical={false} to remove vertical grid lines  + 
                            strokeDasharray="6 6" for horizental design lines */}
                            <XAxis dataKey="name" tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                            {/* dataKey="name" to set the data key (we can change to qunatity to shows nums + 
                            axisLine={false} to remove axis line + 
                            tickLine={false} to remove tick line */}
                            <YAxis tick={{ fill: '#666' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            {/* contentStyle used for white box that pop out
                             cursor={{ fill: 'transparent' }} to remove the bg of the cursor */}
                            <Bar dataKey="quantity" name="Units Sold" radius={[4, 4, 0, 0]} barSize={60}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
