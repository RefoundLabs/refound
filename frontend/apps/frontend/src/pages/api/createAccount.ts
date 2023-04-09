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
  const claimedHandle = await users.findOne({ username: username });

  if (!claimedHandle) {
    return {error: "handle has not been claimed. join the waitlist."}
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
  const { username, email, firstname, lastname, twitterHandle, link, accountId } = req.body;

  const errorMessage = await validateForm(username, email, firstname, lastname, twitterHandle, link);
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
        link: link, 
        walletAddress: accountId
    });

    // newUser
    //     .save()
    //     .then(() =>
    //     res.status(200).json({ msg: "Successfuly created new User: " + newUser })
    //     )
    //     .catch((err: string) =>
    //     res.status(400).json({ error: "Error on '/api/createAccount': " + err })
    //     );

    await users.findOneAndUpdate({ username: username }, 
      {$set: {
        username: username,
        email: email,
        firstname: firstname,
        lastname: lastname,
        twitterHandle: twitterHandle,
        link: link, 
        walletAddress: accountId}
      })
    .then(() =>{
        console.log('success');
        res.status(200).json({ msg: "Successfuly create account " + newUser })
    })
      .catch((err: string) =>
      res.status(400).json({ error: "Error on '/api/createAccount': " + err })
      );

  }

