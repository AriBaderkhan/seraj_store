import asyncWrap from "../utils/asyncWrap.js";
import authService from "../services/authService.js";
import jwt from "jsonwebtoken";

const login = asyncWrap(async (req, res) => {
    const { username, password } = req.body;

    console.log(username, password);
    const result = await authService.login(username, password);

    const payload = { id: result.id, username: result.username, role: result.role }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    res.status(200).json({ message: "Login successful", token: token, username: result.username })
})



export default { login }