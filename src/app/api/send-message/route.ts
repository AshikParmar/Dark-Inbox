import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/model/userModel";
import { sendMessage } from "@/lib/sse";

export async function POST(request: Request) {
    await dbConnect();
    const { username, content } = await request.json();

    try {
        const user = await UserModel.findOne({ username })

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        if (!user.isAcceptingMessages) {
            return Response.json({
                success: false,
                message: "User is not accepting the messages"
            }, { status: 403 });
        }

        const newMessage = { content, createdAt: new Date() }

        user.messages.push(newMessage as Message);
        await user.save();

        const savedMessage = user.messages[user.messages.length - 1];
        sendMessage(username, savedMessage);

        return Response.json({
            success: true,
            message: "message sent successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error sending message ", error);
        return Response.json({
            success: false,
            message: "Error sending message"
        }, {
            status: 500,
        });
    }
}