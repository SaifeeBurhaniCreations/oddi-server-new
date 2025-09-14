import { prisma } from "../config/seeds.js";

async function main() {
  await prisma.seeds(); 
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
