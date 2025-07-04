import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/userModel";


export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
         const user = await UserModel.aggregate([
            { $match: {_id: userId} },
            { $unwind: "$messages" },
            { $sort: {"messages.createdAt": -1} },
            { $group: { _id: "$_id", messages: {$push: "$messages"}} }
         ])
        //  console.log("user",user)

         if(!user || user.length===0){
            return Response.json({
                success: false,
                message: "No messages found"
            }, { status: 404 });
         }

        return Response.json({
            success: true,
            messages: user[0].messages
        }, { status: 201 });

    } catch (error) {
        console.error("Error in getting messages: ", error);
        return Response.json({
            success: false,
            message: "Error in getting messages"
        }, {
            status: 500,
        });
    }

}