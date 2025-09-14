import { prisma } from "./db.js";

// ---- ONLY EDIT THIS ----
export const SEED_DATA = {
  test: [
    { name: "Demo Test A", status: "PASSED", result: "Success" },
    { name: "Demo Test B", status: "FAILED", result: "Error" },
    { name: "Demo Test C", status: "PENDING", result: null },
  ],
};
// ---- DO NOT EDIT BELOW ----

export type DelegateType = typeof prisma[keyof typeof prisma];

Object.entries(SEED_DATA).forEach(([model, data]) => {
  Object.defineProperty(prisma[model as keyof typeof prisma], "seeds", {
    value: async () => {
      await prisma[model].createMany({
        data,
        skipDuplicates: true,
      });
    },
    enumerable: false,
    configurable: false,
    writable: false
  });
});

Object.defineProperty(prisma, "seeds", {
  value: async () => {
    for (const [model, data] of Object.entries(SEED_DATA)) {
      await prisma[model].createMany({
        data,
        skipDuplicates: true,
      });
    }
  },
  enumerable: false,
  configurable: false,
  writable: false
});

export { prisma }; 
