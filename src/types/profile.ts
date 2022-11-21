import { SkinTone } from "@prisma/client";

export type TProfileAddRequestBody = {
    firstName?: string;
    lastName?: string;
    skinTone?: SkinTone;
};

export type TProfileUpdateRequestBody = TProfileAddRequestBody;

export type TFindAvatarResponse = {
    avatar: string;
};
