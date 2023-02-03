import mongoose from "mongoose";
import { stripVTControlCharacters } from "util";
const Schema = mongoose.Schema;

const usersSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        fullname: {
            type: String,
            required: false,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        twitterHandle: {
            type: String,
            required: false,
            unique: false
        },
        bio: {
            type: String,
            required: false,
            unique: false
        },
        type: {
            type: String,
            required: true,
            unique: false
        },
        avatar: {
            type: String,
            required:false,
            unique:false
        },
        walletAddress: {
            type: String,
            required: true,
            unique: false
        },

    }
)

const users = mongoose.models.users || mongoose.model("users", usersSchema);
export default users;