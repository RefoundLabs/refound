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
import type { Post } from "../../../post/domain/post.entity";
import { usePostContracts } from "../../../post/hooks/use-post-contracts";
import { LoadingPage } from "@modules/common/components/loading-page";
import { PostCard } from "../../../post/components/post-card";

export const ProfileView = () => {
	const { account } = useAccount();

    const [editProfile, setEditProfile] = useState(false);

    const [username, setUsername] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
    const [twitterHandle, setTwitterHandle] = useState("");
    const [link, setLink] = useState("");
    const [avatar, setAvatar] = useState("");
    const [avatarFile, setAvatarFile] = useState("");

    const [alert, setAlert] = useState("");
    const [message, setMessage] = useState("");
    const [imageAlert, setImageAlert] = useState("");
    const [imageMessage, setImageMessage] = useState("");

    const { adapter } = usePostContracts();
	const [posts, setPosts] = useState<Nullable<Post[]>>(undefined);
    const [filteredPosts, setFilteredPosts] = useState<Nullable<Post[]>>(undefined);

    const handleEditPressed= () => {
        getUser();
        setEditProfile(true)
    };

    const handleCancelPressed = () => {setEditProfile(false)}; 

    if(editProfile){
        //console.log(editProfile)
    }

    const formSubmit = (actions: any) => {
        actions.setSubmitting(false);
        editUser();
      };

      const redirectToHome = () => {
        const { pathname } = Router;
        if (pathname === "/profile") {
          // TODO: redirect to a success register page
          Router.push("/profile");
          setEditProfile(false);
        }
      };

      const getUser = async() => {
        if(account?.accountId){
            console.log(account.accountId);
            const res = await axios
            .get(
                "/api/getUser?walletAddress="+account.accountId,
                {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                }
                }
            )
            .then(async (response) => {
                //console.log(response.data.data);
                setUsername(response.data.data.username);
                setFirstName(response.data.data.firstname);
                setLastName(response.data.data.lastname);
				setEmail(response.data.data.email);
                setBio(response.data.data.bio);
                setTwitterHandle(response.data.data.twitterHandle);
                setLink(response.data.data.link);
                setAvatar(response.data.data.avatar);
                setWalletAddress(response.data.data.walletAddress)
            })
            .catch((error) => {
                console.log(error);
                //setAlert(error.response.data.error);
            });
            //console.log(res);
        }
      }

    

  const editUser = async () => {
        if(account?.accountId && email && username && bio && firstName && lastName && twitterHandle && link ){
           
            //console.log(category)
            const accountID = account.accountId;
            console.log(accountID)
            const res = await axios
                .put(
                    "/api/editProfile",
                    { username,firstName, lastName, email, bio , twitterHandle, link, accountID},
                    {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    }
                )
                .then(async (res) => {
                    //console.log(res);
                    redirectToHome();
                })
                .catch((error) => {
                    //console.log(error);
                    setAlert(error.response.data.error);
                });
        }
    handleCancelPressed();
  };


  const getBase64= (file:any, cb:any) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            cb(reader.result)
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }
    
    const handleClickAvatarChange = () => {
        console.log('banner change triggered')
        document.getElementById('avatarFileInput')?.click();
    }

    const handleClickAvatarChangeExisting = () => {
        console.log('banner change triggered')
        document.getElementById('avatarFileInputExisting')?.click();
    }

    const editAvatar = async() => {
        if(email && avatar){
            const res = await axios
            .put(
                "/api/editAvatar",
                {  email: email, avatar: avatar },
                {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                }
            )
            .then(async (res) => {
                console.log(res);
                //redirectToHome();
                setImageMessage("Succesfully updated image!");
            })
            .catch((error) => {
                //console.log(error);
                setImageAlert(error.response.data.error);
            });
        }   
    } 

     useEffect(() => {
        getUser();
        
        if(account){
            console.log(account);
            const accountID = account.accountId;
            console.log(accountID)
        }
    }, []);
 
    useEffect(() => {
        if(email){
            console.log(email);
        }

        // if(avatarFile){
        //     const base64file= getBase64(avatarFile, (result:string) => {
        //         //console.log('base64image'+result);
        //         setAvatar(result);
        //     });
        // }

        if(!username){
            getUser();
        }

        //edit avatar
        if(avatarFile){
            getBase64(avatarFile, (result:string) => {
                //console.log('base64image'+result);
                setAvatar(result);
            });

            editAvatar();
        }
    }, [email, username, bio, link, twitterHandle, account, avatar, avatarFile])


    //posts
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

        if(posts && account?.accountId){
            const newPosts = posts.filter((item:any) => item.owner.includes(account?.accountId));
            setFilteredPosts(newPosts);
        }
        console.log(posts);
        console.log(avatar);
    }, [adapter, posts, filteredPosts]); 

	return (
		<div style={{minHeight:"85vh", margin:"5%"}}>
            <Grid>
                <Grid.Col itemID="title" sm={3}><h1 style={{marginLeft:"2%", fontSize:'2em'}}>Profile</h1></Grid.Col>
             </Grid>
            <hr></hr>
        {account &&
        <div >
           
            <Grid> 
                {!editProfile &&
                <>
                    <Grid.Col sm={4} itemID="profile">
                        <div style={{marginTop:"5%"}}>
                            <div style={{margin:"0"}}>
                                {!avatar && 
                                <div style={{textAlign:"center"}} onClick={handleClickAvatarChange} >
                                    <CgProfile style={{display:"inline"}} width="80%"/> 
                                    <FiCamera style={{display:"inline", cursor:"pointer", marginLeft:"5px"}} />
                                    <Input id="avatarFileInput"
                                            value={undefined} 
                                            type="file" 
                                            accept="image/*" style={{display:"none"}}
                                            onChange={async(e:any) => {
                                                const file = (e.target.files[0])
                                                setAvatarFile(file);
                                            }}
                                        />   
                                </div>}
                                {avatar && 
                                <div style={{textAlign:"left", width:"80%"}} onClick={handleClickAvatarChangeExisting}>
                                    <img src={avatar} width="80%" style={{display:"inline", borderRadius:"15px"}}></img> 
                                    <FiCamera style={{display:"inline", cursor:"pointer", marginLeft:"5px"}}  />
                                    <Input id="avatarFileInputExisting"
                                            value={undefined} 
                                            type="file" 
                                            accept="image/*" style={{display:"none"}}
                                            onChange={async(e:any) => {
                                                const file = (e.target.files[0])
                                                setAvatarFile(file);
                                            }}
                                        />    
                                </div>}
                            </div>
                            <div style={{textAlign:"left", width:"80%"}}>
                                <h4 style={{fontSize:"2em"}}>@{username}</h4>
                                <h5 style={{fontSize:"1.5em"}}>{firstName} {lastName}</h5>
                                <h5 style={{fontSize:"1.25em"}}>{bio}</h5>
                                <Grid >
                                    {twitterHandle && 
                                        <Grid.Col sm={1}><Link href={"https://twitter.com/"+ twitterHandle.toString()} key="twitter" target="_blank"><FiTwitter style={{fontSize:"1.5em", color:"#24C5EF"}}></FiTwitter></Link></Grid.Col>
                                    }
                                    {link && 
                                        <Grid.Col sm={1}><Link href={link.toString()} key="link" target="_blank"><FiGlobe style={{fontSize:"1.5em", color:"#24C5EF"}}></FiGlobe></Link></Grid.Col>
                                    }
                                </Grid>
                                {account?.accountId && <h5 style={{fontSize:"1.25em"}}>Near Wallet Address: {account.accountId.toString().substring(0,10)}...</h5>}
                            </div>
                            <br></br>
                            {imageAlert && <Alert style={{backgroundColor:"red"}}>{imageAlert}</Alert>}
                            {imageMessage && <Alert style={{backgroundColor:"green"}}>{imageMessage}</Alert>}
                            <Button onClick={handleEditPressed} style={{margin:"0% 1%!important", backgroundColor:"black"}} size="xs">Edit Profile <FiEdit2 style={{marginLeft:"5px"}}/></Button>
                        </div>
                    </Grid.Col>
                    <Grid.Col sm={8} itemID="nfts">
                        <div style={{marginTop:"2%"}}>
                            <h1 style={{fontSize:"2em"}}>Images</h1>
                            <section className="flex flex-col w-full px-contentPadding max-w-screen-lg mx-auto min-h-[101vh]">
                                <div className="grid grid-cols-1 gap-4 py-24 md:grid-cols-3">
                                    {filteredPosts ? (
                                        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
                                    ) : (
                                        <LoadingPage />
                                    )}
                                </div>
                            </section>
                        </div>
                    </Grid.Col>
                </>
                }
                {editProfile && //account && 
                <>
                    <Grid.Col sm={2}><h1 style={{fontSize:"1.5em"}}>Edit Profile</h1></Grid.Col>
                    <Grid.Col sm={8} style={{marginTop:"2%"}}>                        
                    <Formik
                            initialValues={{ username: username, bio: bio, twitterHandle: twitterHandle, link: link}} 
                            validateOnChange={false}
                            validateOnBlur={false}
                            onSubmit={(_, actions) => {
                            formSubmit(actions);
                            }}
                        >
                            {(props) => (
                            <Form style={{ width: "100%" }} >
                                <Box mb={4}>
                                <Field name="username">
                                    {() => (
                                    <>
                                        <Text>Username:</Text>
                                        <Input size="xs"
                                        value={username}
                                        onChange={(e:any) => setUsername(e.target.value)}
                                        placeholder={username || "username"}
                                        />
                                    </>
                                    )}
                                </Field>
								<Field name="firstname">
                                    {() => (
                                    <>
                                        <Text>First Name:</Text>
                                        <Input size="xs"
                                        value={firstName}
                                        onChange={(e:any) => setFirstName(e.target.value)}
                                        placeholder={firstName || "First Name"}
                                        />
                                    </>
                                    )}
                                </Field>
								<Field name="lastname">
                                    {() => (
                                    <>
                                        <Text>Last Name:</Text>
                                        <Input size="xs"
                                        value={lastName}
                                        onChange={(e:any) => setLastName(e.target.value)}
                                        placeholder={lastName || "Last Name"}
                                        />
                                    </>
                                    )}
                                </Field>
                                <Field name="bio">
                                    {() => (
                                    <>
                                        <Text><FiEdit2></FiEdit2>Bio:</Text>
                                        <Input size="xs"
                                        value={bio}
                                        onChange={(e:any) => setBio(e.target.value)}
                                        placeholder={bio}
                                        />
                                    </>
                                    )}
                                </Field>
                                <Field name="twitterHandle">
                                    {() => (
                                    <>
                                        <Text><FiTwitter></FiTwitter>Twitter Handle</Text>
                                        <Input size="xs"
                                        value={twitterHandle}
                                        onChange={(e:any) => setTwitterHandle(e.target.value)}
                                        placeholder={twitterHandle}
                                        />
                                    </>
                                    )}
                                </Field>
                                <Field name="link">
                                    {() => (
                                    <>
                                        <Text>Other Link<FiGlobe></FiGlobe></Text>
                                        <Input size="xs"
                                        value={link}
                                        onChange={(e:any) => setLink(e.target.value)}
                                        placeholder={link}
                                        />
                                    </>
                                    )}
                                </Field>
                                <span style={{display:"inline", marginTop:'5%'}}>
                                    <Button type="submit" style={{margin:"0 20%", backgroundColor:"green"}}>Save<FiEdit2 style={{marginLeft:"5px", display:"inline"}}/></Button>
                                    <Button type="button" onClick={handleCancelPressed} style={{margin:"0 2%",backgroundColor:"black", display:"inline"}}>Cancel</Button>
                                </span>
                                </Box>
                            </Form>
                            )}
                        </Formik>

                    {alert && <Alert color={"red"} style={{marginTop:"5%"}}>{alert}</Alert>}
                    </Grid.Col>
                    <Grid.Col sm={2}></Grid.Col>
                    </>
                }
            </Grid>
        </div>
    }
    </div>
	);
};
