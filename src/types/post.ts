export type TPostFindByIdParams = {
    postId: string;
};

export type TPostDeleteParams = TPostFindByIdParams;
export type TPostUpdateParams = TPostFindByIdParams;

export type TPostAddRequestBody = {
    content: string;
};

export type TPostUpdateRequestBody = TPostAddRequestBody;
