import multer from "multer";
import path from "path";
import fs from "fs";

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export default function uploadImage(folderName, options = {}) {
    const {
        maxSizeMB = 3,
        allowedMime = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/avif"],
    } = options;

    const uploadDir = `uploads/${folderName}`;
    ensureDir(uploadDir);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${unique}${ext}`);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (!allowedMime.includes(file.mimetype)) {
            return cb(new Error("Invalid file type. Only JPG/PNG/WEBP allowed."), false);
        }
        cb(null, true);
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
    });
}
