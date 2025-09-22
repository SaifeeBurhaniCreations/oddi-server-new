import { PrismaClient } from '@prisma/client'; 
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();
const suffix = "DB";

const modelKeys = Object.keys(prisma)
  .filter((key) => typeof (prisma as any)[key]?.findMany === "function");

const lines = modelKeys.map(
  (k) => `export const ${k}${suffix} = prisma.${k} as typeof prisma.${k} & { seeds?: () => Promise<void> };`
);
// const lines = modelKeys.map(
//   (k) => `export const ${k}${suffix}: PrismaClient['${k}'] = prisma.${k};`
// );

const fileOut = `import { prisma } from "../config/seeds.js";

${lines.join("\n")}
`;

writeFileSync("src/db/aliases.ts", fileOut);
console.log("Model delegates exported to src/db/aliases.ts");
