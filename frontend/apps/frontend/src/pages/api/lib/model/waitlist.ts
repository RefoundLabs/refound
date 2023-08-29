import mongoose from "mongoose";
import { stripVTControlCharacters } from "util";
const Schema = mongoose.Schema;

const waitlistSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: false,
            unique: true
        },
        firstname: {
            type: String,
            required: false,
            unique: false
        },
        lastname: {
            type: String,
            required: false,
            unique: false
        },
        twitterHandle: {
            type: String,
            required: false,
            unique: false
        },
        link: {
            type: String,
            required: false,
            unique: false
        },

    }
)

const users = mongoose.models.waitlist || mongoose.model("waitlist", waitlistSchema);
export default users;