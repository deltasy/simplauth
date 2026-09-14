import type { Response } from "supertest"

export function extractCookieValue(cookie: string | undefined, cookieName: string): string | null {
    if (!cookie || !Array.isArray(cookie)) return null;

    const targetCookie = cookie.find(cookie => cookie.startsWith(`${cookieName}=`));

    if (!targetCookie) return null;
    return targetCookie.split(';')[0]!.split('=')[1]!;
}

export function extractTokens(response: Response){
    const cookie = response.header["set-cookie"] as string

    const refreshToken = extractCookieValue(cookie, "refreshToken") as string;
    let accessToken = response.body["token"]

    return { accessToken, refreshToken }
}