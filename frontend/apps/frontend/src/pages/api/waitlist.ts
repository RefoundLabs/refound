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
  email: string,
  firstname: string,
  lastname: string,
  twitterHandle: string,
  link: string
) => {
  console.log( email, firstname, lastname, twitterHandle, link);
 
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
  const { email, firstname, lastname, twitterHandle, link } = req.body;

  const errorMessage = await validateForm(email, firstname, lastname, twitterHandle, link);
  if (errorMessage) {
    return res.status(400).json(errorMessage as ResponseData);
  }

 
      // create new User on MongoDB
    const newUser = new users({
        email: email,
        firstname: firstname,
        lastname: lastname,
        twitterHandle: twitterHandle,
        link: link
    });

    newUser
        .save()
        .then(() =>
        res.status(200).json({ msg: "Successfuly created new User: " + newUser })
        )
        .catch((err: string) =>
        res.status(400).json({ error: "Error on '/api/waitlist': " + err })
        );
  }

