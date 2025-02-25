import { Webhook } from "svix";
import User from "../models/User.js";

// API Controller function to manage Clerk users with database
const clerkWebhooks = async (req, res) => {
    try {
        // Ensure required headers exist
        const svixId = req.headers["svix-id"];
        const svixTimestamp = req.headers["svix-timestamp"];
        const svixSignature = req.headers["svix-signature"];

        if (!svixId || !svixTimestamp || !svixSignature) {
            return res.status(400).json({ success: false, message: "Missing webhook headers" });
        }

        // Create a Svix instance with Clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Verifying Headers
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        });

        // Getting data from request body
        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address, // Fixed typo in `email_addresses`
                    name: `${data.first_name} ${data.last_name}`,
                    image: data.image_url,
                    resume: "",
                };
                await User.create(userData);
                res.json({ success: true, message: "User created" });
                break;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    image: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                res.json({ success: true, message: "User updated" });
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                res.json({ success: true, message: "User deleted" });
                break;
            }

            default:
                res.status(400).json({ success: false, message: "Unknown webhook event" });
                break;
        }
    } catch (error) {
        console.error("Webhook Error:", error.message);
        res.status(500).json({ success: false, message: "Webhooks error" });
    }
};

// Named export
export { clerkWebhooks };
