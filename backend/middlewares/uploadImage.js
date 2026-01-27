import multer from "multer";

export default function uploadImage(folderName, options = {}) {
    const {
        maxSizeMB = 3,
        allowedMime = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/avif"],
    } = options;

    // Use memory storage so we can access the buffer
    const storage = multer.memoryStorage();

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
