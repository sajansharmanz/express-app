import { Prisma } from "@prisma/client";
import { PERMISSIONS } from "./permissions";

const roles: Prisma.RoleCreateInput[] = [
    {
        name: "Administrator",
        description: "A super user with access to everything",
        system: true,
        permissions: {
            connect: Object.values(PERMISSIONS).map((p) => ({ name: p })),
        },
    },
    {
        name: "User",
        description: "Default role added to users who sign up",
        system: true,
        permissions: {
            connect: [
                { name: PERMISSIONS.CREATE_COMMENTS },
                { name: PERMISSIONS.READ_COMMENTS },
                { name: PERMISSIONS.UPDATE_COMMENTS },
                { name: PERMISSIONS.DELETE_COMMENTS },
                { name: PERMISSIONS.CREATE_FILES },
                { name: PERMISSIONS.READ_FILES },
                { name: PERMISSIONS.DELETE_FILES },
                { name: PERMISSIONS.READ_POSTS },
            ],
        },
    },
];

export default roles;
