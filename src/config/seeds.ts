import { uuidv4 } from "../sbc/utils/uuid/uuidv4.js";
import { prisma } from "./infra/prisma.js";

// ---- ONLY EDIT THIS ----
const rootId = uuidv4();

export const SEED_DATA = {
  user: [
    { id: rootId, name: "Root Admin", email: "admin@oddiville.com", password: "$2b$10$EeetXBwuOkZuy0/V.1g.r.25rIyt/zGCHaJOiU6COQjq/3uhbWmrm", address: "Malwa Mill, Indore", contact: "1234567890", role: "ADMIN", profilePic: "http://localhost:3000/image/user/admin-image.png", createdBy: null },

    { name: "OddiVille Manager", email: "manager@oddiville.com", password: "$2b$10$EeetXBwuOkZuy0/V.1g.r.25rIyt/zGCHaJOiU6COQjq/3uhbWmrm", address: "Dhar Road, Indore", contact: "0987654321", role: "MANAGER", profilePic: "http://localhost:3000/image/user/manager-image.png", createdBy: rootId },
  ],
};
// ---- DO NOT EDIT BELOW ----

export type DelegateType = typeof prisma[keyof typeof prisma];

Object.entries(SEED_DATA).forEach(([model, data]) => {
  if (typeof prisma[model as keyof typeof prisma] === 'object' && prisma[model as keyof typeof prisma] !== null) {
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
}
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
