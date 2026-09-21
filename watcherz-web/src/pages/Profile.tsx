import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProfileData, type User } from "../services/userService";

export default function Profile() {
    const [user, setUser] = useState<User>();

    let { profile_name } = useParams();
    if(!profile_name) return;

    useEffect(() => {
        getProfileData(profile_name).then(data => {
            setUser(data);
        });

    }, []);

    console.log(user)

    if(!user) return (
        <div className="flex flex-col gap-1 font-bold p-6 text-red-500">
            <span className="text-6xl">404</span>
            Usuário não encontrado
        </div>
    );

    const creationDate = user.createdAt.split("T")[0].split("-")

    return (
        <div className="bg-black text-white p-6">
            <h1 className="mb-2 font-bold text-xl">PERFIL PÚBLICO:</h1> 
            <ul className="flex flex-col gap-2 mt-6">
                <li>
                    <h2 className="text-md font-semibold">Nickname:</h2> 
                    {user.username}
                </li>
                <li>
                    <h2 className="text-md font-semibold">Data de registro:</h2> 
                    {creationDate[2] + "/" + creationDate[1] + "/" + creationDate[0]}
                </li>
            </ul>

        </div>
    );
}