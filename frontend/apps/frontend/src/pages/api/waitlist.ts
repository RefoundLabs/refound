// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "./lib/connectdb";
import users from "./lib/model/users";

interface ResponseData {
  error?: string;
  msg?: string;
}

const validateEmail = (email: string): boolean => {
  const regEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regEx.test(email);
};

const validateForm = async (
  username: string,
  firstname: string,
  lastname: string,
  email: string,
  twitterHandle: string,
  bio: string,
  type: string,
  avatar: string,
  walletAddress: string
) => {
  console.log(username, email, firstname, lastname, twitterHandle, bio, type, walletAddress);
 
  if (!validateEmail(email)) {
    return { error: "Email is invalid" };
  }

  await dbConnect();
  const emailUser = await users.findOne({ email: email });

  if (emailUser) {
    return { error: "Email already exists" };
  }

  return null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // validate if it is a POST
  if (req.method !== "POST") {
    return res
      .status(200)
      .json({ error: "This API call only accepts POST methods" });
  }

  // get and validate body variables
  const { username, firstname, lastname, email, twitterHandle, bio, type, avatar, walletAddress } = req.body;

  const errorMessage = await validateForm(username, firstname, lastname, email, twitterHandle, bio, type, avatar, walletAddress);
  if (errorMessage) {
    return res.status(400).json(errorMessage as ResponseData);
  }

 
      // create new User on MongoDB
    const newUser = new users({
        username: username,
        email: email,
        firstname: firstname,
        lastname: lastname,
        twitterHandle: twitterHandle,
        bio: bio,
        type:type,
        avatar: avatar, 
        walletAddress:walletAddress
    });

    newUser
        .save()
        .then(() =>
        res.status(200).json({ msg: "Successfuly created new User: " + newUser })
        )
        .catch((err: string) =>
        res.status(400).json({ error: "Error on '/api/register': " + err })
        );
  }

