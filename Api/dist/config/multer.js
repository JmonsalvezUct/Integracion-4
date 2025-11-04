import multer from 'multer';
import path from 'path';
// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
// Validación de tipos de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Solo se permiten archivos JPEG, PNG, PDF y DOCX'));
    }
};
// Configuración de Multer
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB límite
    },
    fileFilter: fileFilter
});
//# sourceMappingURL=multer.js.map