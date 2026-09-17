import { Test } from "supertest";

// Monkey patching
declare module "supertest" {
    interface Test {
        withAuth(accessToken: string, refreshToken?: string): this;
    }
}

(Test.prototype as any).withAuth = function (accessToken: string, refreshToken?: string) {
    if(refreshToken){
        return this
            .set("Cookie", `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`);
    }

    return this
        .set("Authorization", `Bearer ${accessToken}`);
};
