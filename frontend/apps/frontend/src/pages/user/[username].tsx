import { useAccount } from "@modules/account/hooks/use-account";

import type { NextPage } from 'next'
import Link from 'next/link';
import Head from 'next/head'
import Image from 'next/image'
import {
    createStyles,
    Menu,
    Center,
    Header,
    Container,
    Group,
    Burger,
    Grid, Input, 
    Card,
    Button, Text, Box, Alert
  } from '@mantine/core';
  import Router from "next/router";
import { Field, Form, Formik } from "formik";
import { TextInput, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { CgMenuGridR, CgProfile, CgCamera } from 'react-icons/cg';
import {FiEdit2, FiInstagram,FiCamera, FiTwitter, FiGlobe, FiMail} from 'react-icons/fi'
import {FiArchive, FiUpload} from 'react-icons/fi';
import {useSession ,signIn, signOut} from 'next-auth/react';
import { userAgent } from 'next/server';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from "axios";
import AxiosResponse from "axios";
import { link } from 'fs';
import { toast } from "@services/toast/toast";
import type { Nullable } from "@utils/helper-types";
import type { Post } from "../../modules/post/domain/post.entity";
import { usePostContracts } from "../../modules/post/hooks/use-post-contracts";
import { LoadingPage } from "@modules/common/components/loading-page";
import { PostCard } from "../../modules/post/components/post-card";
import { useRouter } from 'next/router';

const User: NextPage = () => {
    const { account } = useAccount();

    const [username, setUsername] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [twitter, setTwitter] = useState("");
    const [link, setLink] = useState("");
    const [avatar, setAvatar] = useState("");
    const [images, setImages] = useState<any[]>([]);
    const [alert, setAlert] = useState("");
    const [message, setMessage] = useState("");
    const { adapter } = usePostContracts();
	const [posts, setPosts] = useState<Nullable<Post[]>>(undefined);
    const [filteredPosts, setFilteredPosts] = useState<Nullable<Post[]>>(undefined);

    const router = useRouter();
    useEffect(()=>{

          if(!email){
            //console.log('get user')
            getUser();
          }
      
    }, []);

  useEffect(() => {

    if(!email){
        //console.log('get user')
        getUser();
    }else{
        //console.log('get posts');
        // if(!posts || posts.length == 0){
        //     console.log('get posts');
        //     getUserPosts(); 
        // }
    }

    
  }, [username, fullname, email, images, avatar, bio, link, twitter])


    useEffect(()=>{
        if(!router.isReady) return;
        //console.log(router.query);
        if(router.query.username){
            if(router.query.username.length == 64){
                //console.log('set wallet adress')
                //console.log(router.query.username)
                setWalletAddress(router.query.username.toString())
            }else{
                setUsername(router.query.username.toString());
            }
        }
    }, [router.isReady]);

    useEffect(() => {
		if (!adapter) return;

        if(!posts){
            adapter.getPosts({}).then((result:any) =>
                result.match({
                    ok: (posts:any) => { setPosts(posts)},
                    fail: (error:any) => {
                        toast.error(error.message, "no-posts");
                    },
                }),
            );
        }

        if(posts && walletAddress){
            const newPosts = posts.filter((item:any) => item.owner.includes(walletAddress));
            setFilteredPosts(newPosts);
        }else if(posts && username && !walletAddress){
            const newPosts = posts.filter((item:any) => item.owner.includes(username));
            setFilteredPosts(newPosts);
        }
	}, [adapter, posts, filteredPosts]); 


  const getUser = async() => {
    console.log('get user')
    if(username && username.length != 64){
        const res = await axios
        .get(
            "/api/getUser?username="+username,
            {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            }
            }
        )
        .then(async (response) => {
            console.log(response.data.data);
            setEmail(response.data.data.email);
            setWalletAddress(response.data.data.walletAddress);
            setFullname(response.data.data.firstname + " " + response.data.data.lastname);
            setBio(response.data.data.bio);
            setTwitter(response.data.data.twitterHandle);
            setLink(response.data.data.link);
            setAvatar(response.data.data.avatar);
           console.log(response.data.data.bio)
        })
        .catch((error) => {
            console.log(error);
            //setAlert(error.toString());

        });
        //console.log(res);
    }else if(walletAddress){
        const res = await axios
        .get(
            "/api/getUser?walletAddress="+walletAddress,
            {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            }
            }
        )
        .then(async (response) => {
            console.log(response.data.data);
            setEmail(response.data.data.email);
            setFullname(response.data.data.firstname + " " + response.data.data.lastname);
            setUsername(response.data.data.username);
            setBio(response.data.data.bio);
            setTwitter(response.data.data.twitterHandle);
            setLink(response.data.data.link);
            setAvatar(response.data.data.avatar);
           console.log(response.data.data.bio)
        })
        .catch((error) => {
            console.log(error);
            //setAlert(error);
        });
    }
  }


  return (
        <>
            <Grid style={{margin:"5% 2%"}}> 
                    <Grid.Col sm={4} itemID="profile">
                        <div style={{marginTop:"5%"}}>
                            <div style={{margin:"0"}}>
                                {!avatar && 
                                <div style={{width:"100%"}} >
                                    <CgProfile style={{display:"inline", fontSize:"5em", margin:"0 auto"}} /> 
                                </div>}
                                {avatar && 
                                <div style={{textAlign:"left", width:"80%"}}>
                                    <img src={avatar} width="80%" style={{display:"inline", borderRadius:"15px"}}></img> 
                                </div>}
                            </div>
                            <div style={{textAlign:"left", width:"80%"}}>
                                <h4 style={{fontSize:"2em"}}>@{username}</h4>
                                <p style={{fontSize:"1.5em"}}>{fullname}</p>
                                <p style={{fontSize:"1.25em"}}>{bio}</p>
                                <Grid >
                                    {twitter && 
                                        <Grid.Col sm={1}><Link href={"https://twitter.com/"+ twitter.toString()} key="twitter" target="_blank"><FiTwitter style={{fontSize:"1.5em", color:"#24C5EF"}}></FiTwitter></Link></Grid.Col>
                                    }
                                    {link && 
                                        <Grid.Col sm={1}><Link href={link.toString()} key="link" target="_blank"><FiGlobe style={{fontSize:"1.5em", color:"#24C5EF"}}></FiGlobe></Link></Grid.Col>
                                    }
                                </Grid>
                                {account?.accountId && <p style={{fontSize:"1.25em", marginTop:"20px"}}>Near Wallet Address: {walletAddress.substring(0,10)}...</p>}
                            </div>
                            <br></br>
                            {alert && <Alert style={{backgroundColor:"red"}}>{alert}</Alert>}
                            {message && <Alert style={{backgroundColor:"green"}}>{message}</Alert>}
                            <Button style={{margin:"0% 1%!important", backgroundColor:"black"}} size="xs">Donate</Button>
                        </div>
                    </Grid.Col>
                    <Grid.Col sm={8} itemID="nfts">
                        <div>
                            <>
                                <h1 style={{fontSize:"2em"}}>Images</h1>
                                {filteredPosts && 
                                    <section className="flex flex-col w-full px-contentPadding max-w-screen-lg mx-auto min-h-[101vh]">
                                        <div className="grid grid-cols-1 gap-4 py-24 md:grid-cols-3">
                                            {filteredPosts ? (
                                                filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
                                            ) : (
                                                <LoadingPage />
                                            )}
                                        </div>
                                    </section>
                                }
                            </>
                        </div>
                    </Grid.Col>
            </Grid>
        {!email &&
            <p>Loading...</p>
        }
        </>
  );
}

export default User