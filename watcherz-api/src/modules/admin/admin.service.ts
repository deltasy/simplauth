import { userDB } from "../../shared/database/prisma.service.js";

export const AdminService = {
    async restoreDeletedUser(username: string){
        await userDB.updateMany({
            where: {
                username: username,
                is_deleted: true
            }, data: {
                is_deleted: false
            }
        })
    }

    
}