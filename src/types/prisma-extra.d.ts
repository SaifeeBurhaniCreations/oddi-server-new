import { PrismaClient } from "@prisma/client";

declare module "@prisma/client" {
  interface PrismaClient {
    seeds: () => Promise<void>;
    [key: string]: any; 
  }
}

declare module "@prisma/client" {
  interface PrismaClient {
    [key: string]: any;
  }
}