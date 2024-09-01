import { Request, Response } from "express";
import Form from "../models/Form";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  //   DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    secretAccessKey: secretAccessKey as string,
    accessKeyId: accessKeyId as string,
  },
  region: bucketRegion,
});

export default {
  async create(req: Request, res: Response) {
    try {
      const { userId, projectsWorkedOn, summary, questions } = req.body;

      if (!userId || !projectsWorkedOn || !summary) {
        return res
          .status(403)
          .json({ message: "Invalid request, missing form data" });
      }

      if (req.files?.length === 0) {
        return res
          .status(403)
          .json({ message: "Invalid request, missing screenshots" });
      }

      const imageNames = [] as any[];

      (req.files as Express.Multer.File[]).forEach(
        async (file: Express.Multer.File) => {
          const randomImageName = crypto.randomBytes(32).toString("hex");
          imageNames.push(randomImageName);

          const putObjectParams = {
            Bucket: bucketName,
            Key: randomImageName,
            Body: file.buffer,
            ContentType: file.mimetype,
          };

          const command = new PutObjectCommand(putObjectParams);
          await s3.send(command);
        }
      );

      const jwtData = jwt.decode(userId);

      if (jwtData) {
        const {
          sub: { _id },
        } = jwtData as any;
        await Form.create({
          userId: _id,
          projectsWorkedOn,
          summary,
          questions,
          screenshots: imageNames,
        });
      }

      res.status(200).json({ message: "Formulário salvo!" });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err });
    }
  },
  async read(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res
          .status(403)
          .json({ message: "Invalid request, missing userId" });
      }

      const jwtData = jwt.decode(userId);

      const {
        sub: { _id },
      } = jwtData as any;

      const getForm = await Form.find({ userId: _id });

      if (getForm.length > 0) {
        getForm.forEach(({ screenshots }, index) => {
          screenshots.forEach(async (screenshot: string, ssIndex: number) => {
            const getObjectParams = {
              Bucket: bucketName,
              Key: screenshot,
            };

            const command = new GetObjectCommand(getObjectParams);
            const imageUrl = await getSignedUrl(s3, command, {
              expiresIn: 604800, //expires in a week
            });

            getForm[index].screenshots[ssIndex] = imageUrl;
          });
        });

        setTimeout(() => res.status(200).json(getForm));
      } else return res.status(200).json([]);
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err });
    }
  },
};
