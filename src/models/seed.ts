import prisma from "../configs/prisma";
import Logger from "../configs/logger";
import { permissions } from "./data/permissions";
import roles from "./data/roles";

const seed = (action: () => void, cb?: () => void): void => {
    action();

    if (cb) {
        setTimeout(() => cb(), 1000);
    }
};

const seedPermissions = () => {
    permissions.forEach(async (p) => {
        await prisma.permission.upsert({
            where: {
                name: p.name,
            },
            create: p,
            update: p,
        });
    });
};

const seedRoles = () => {
    roles.forEach(async (r) => {
        await prisma.role.upsert({
            where: {
                name: r.name,
            },
            create: r,
            update: r,
        });
    });
};

const seedSiteSettings = async () => {
    const settings = await prisma.siteSettings.count();

    if (settings >= 1) return;

    await prisma.siteSettings.create({
        data: {},
    });
};

async function main() {
    seed(seedPermissions, () => seed(seedRoles, () => seed(seedSiteSettings)));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        Logger.error(e);
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
