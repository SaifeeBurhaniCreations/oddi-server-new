import type { Consumer, Producer } from "kafkajs";
import { S3Client } from "../../sbc/utils/s3-image-uploader/s3-image-uploader.js"

export type Variables = {
    s3: S3Client;
    producer: Producer;
    consumer: Consumer;
  };