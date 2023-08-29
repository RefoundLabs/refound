// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "./lib/connectdb";
import waitlist from "./lib/model/waitlist";
import { ObjectId } from "mongodb";
import { useInputProps } from "@mantine/core";

interface ResponseData {
  error?: string;
  success?: boolean;
  msg?: string;
  data?: any[];
}
const getUserInWaitlist = async (email: string, username: string) =>{
    await dbConnect();
    
    const Users = await waitlist.findOne({email: email, username: username});

    return Users;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {

  // validate if it is a GET
  if (req.method !== "GET") {
    return res
      .status(200)
      .json({ error: "This API call only accepts GET methods" });
  }
  let username = "";
  let Email = "";
  let walletAddress = "";

  const queryVal = "";
  console.log(req.query)
  if(req.query.userEmail && req.query.username){
    username = req.query.username.toString();
    Email = req.query.userEmail.toString();
    try{
        const user = await getUserInWaitlist(Email.toString(), username.toString());
        console.log('user in waitlist: ' + user);

        return res.status(200).json({ success: true, data: user });
    }catch(err: any){
      return res.status(400).json({ error: "Error on '/api/getUser', user not found: " + err })
    }
  }
  
}