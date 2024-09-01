import express from 'express'
import UserController from '../controllers/UserController';
import FormController from '../controllers/FormController';
import verifyUser from '../middlewares/verifyUser';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

//Users
router.post("/sign-up", UserController.add);
router.post("/sign-in", UserController.login);
router.post("/verify-token", verifyUser, UserController.verifyIfTokenIsValid);

//Forms
router.post("/create/form", verifyUser, upload.any(), FormController.create);
router.get("/read/form/:userId", verifyUser, FormController.read);

export default router;