import authModel from "../models/authModel.js"
import appError from "../utils/appError.js"
import bcrypt from "bcrypt"


const DUMMY_HASH = '$2b$10$1VnSDoUZPwK1d5DKFwRz9Oe2C1wq1k2F5qHk0G9mR3lQZ1x7E3J3S';


async function login(username, password) {

    const existUser = await authModel.checkLogin(username);

    const userPassword = existUser.password || DUMMY_HASH;

    const pwd = String(password || '');
    const isPasswordvalid = await bcrypt.compare(pwd, userPassword);
    if (!existUser || !isPasswordvalid) throw appError("INVALID_CREDENTIALS", "Invalid credentials", 401);


    return {
        id: existUser.id,
        username: existUser.username,
        role: existUser.role,
    }
}


export default { login }