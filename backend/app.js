import express from "express";
const app = express();
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 1999;


import cors from 'cors';
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));



import errorMiddleware from "./middlewares/errorMiddleware.js";
import requestIdMiddleware from "./middlewares/requestIdMiddleware.js";
app.use(requestIdMiddleware);

import authRoute from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import brandRoute from "./routes/brandRoute.js";
import itemRoute from './routes/itemRoute.js';
import cartRoute from './routes/cartRoute.js';
import saleRoute from './routes/saleRoute.js';
import expensesRoute from './routes/expensesRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
import reportRoute from './routes/reportRoute.js';


app.use(express.json());
// prevent situation that data sent from a form , without this req.body becomes undefined
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
}); // for health check of the project

app.use("/uploads", express.static("uploads"));

app.use('/api/auth', authRoute);
app.use('/api/category', categoryRoute);
app.use('/api/brand', brandRoute);
app.use('/api/item', itemRoute);
app.use('/api/cart', cartRoute);
app.use('/api/sale', saleRoute);
app.use('/api/expense', expensesRoute);
app.use('/api/dashboard', dashboardRoute)
app.use('/api/report', reportRoute)

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found", code: "ROUTE_NOT_FOUND", support_code: req.requestId || 'N/A'
    });
});

app.use(errorMiddleware)
app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});