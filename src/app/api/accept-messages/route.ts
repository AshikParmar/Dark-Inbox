import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/userModel";


export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, { status: 401 });
    }

    const userId = user._id
    const { acceptMessages } = await request.json();

    try {
        const updateduser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        )

        if(!updateduser){
            return Response.json({
                success: false,
                message: "User not found"
            }, {status: 404});
        }

        return Response.json({
            success: true,
            message: "Message acceptance status updated successfully",
            updateduser
        }, {status: 200});


    } catch (error) {
        console.log("Failed to update user status to accept messages")
        return Response.json({
            success: false,
            message: "Failed to update user status to accept messages"
        }, { status: 500 });
    }
}

export async function GET(request: Request){
    await dbConnect();
    const session = await getServerSession(authOptions);

    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, { status: 401 });
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
    
        if(!foundUser){
            return Response.json({
                success: false,
                message: "User not found"
            }, {status: 404});
        }
    
        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessages
        }, {status: 200});

    } catch (error) {
        console.log("Error in getting message acceptance status")
        return Response.json({
            success: false,
            message: "Error in getting message acceptance status"
        }, { status: 500 });
    }
}