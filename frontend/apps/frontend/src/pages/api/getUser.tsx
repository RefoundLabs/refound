// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "./lib/connectdb";
import users from "./lib/model/users";
import { ObjectId } from "mongodb";

interface ResponseData {
  error?: string;
  success?: boolean;
  msg?: string;
  data?: any[];
}
const getUserByEmail = async (email: string) =>{
    await dbConnect();
    console.log(email);
    
    return await users.findOne({email: email});
}

const getUserByUsername = async (username: string) =>{
  await dbConnect();
  console.log(username);
  return await users.findOne({username: username});
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
  const queryVal = "";
  if(req.query.userEmail){
    Email = req.query.userEmail.toString();
    try{
        const user = await getUserByEmail(Email.toString());
        return res.status(200).json({ success: true, data: user });
    }catch(err: any){
      return res.status(400).json({ error: "Error on '/api/getUser': " + err })
    }
  }
  else if(req.query.username){
    username = req.query.username.toString();
    console.log(username);
    try{
        const user = await getUserByUsername(username.toString());
        return res.status(200).json({ success: true, data: user });
    }catch(err: any){
      return res.status(400).json({ error: "Error on '/api/getUser': " + err })
    }
  }
  
}