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
import { CgProfile } from 'react-icons/cg';
import {FiEdit2, FiInstagram, FiTwitter, FiGlobe, FiMail} from 'react-icons/fi'
import {FiArchive, FiUpload} from 'react-icons/fi';
import {useSession ,signIn, signOut} from 'next-auth/react';
import { userAgent } from 'next/server';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from "axios";
import AxiosResponse from "axios";
import { link } from 'fs';

export const ProfileView = () => {
	const { account } = useAccount();

    const [editProfile, setEditProfile] = useState(false);

    const [username, setUsername] = useState("");
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
        if(email){
            //console.log(email);
            const res = await axios
            .get(
                "/api/getUser?userEmail="+email,
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
				setEmail(response.data.data.email);
                setBio(response.data.data.bio);
                setTwitterHandle(response.data.data.twitterHandle);
                setLink(response.data.data.link1);
                setAvatar(response.data.data.avatar);
            })
            .catch((error) => {
                console.log(error);
                setAlert(error);
            });
            //console.log(res);
        }
      }

    

  const editUser = async () => {
        if(email && username && avatar && bio && firstName && lastName && twitterHandle && link ){
            //console.log('category')
            //console.log(category)
            const res = await axios
                .put(
                    "/api/editProfile",
                    { username,firstName, lastName, email, bio , twitterHandle, link, avatar},
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
                    setAlert(error);
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
    


     useEffect(() => {
        getUser();
        
    }, []);
 
    useEffect(() => {
        if(email){
            //console.log(email);
        }

        if(avatarFile){
            const base64file= getBase64(avatarFile, (result:string) => {
                //console.log('base64image'+result);
                setAvatar(result);
            });
        }

        if(!username){
            getUser();
        }
    }, [email, username, bio, link, twitterHandle, account, avatar, avatarFile])


	return (
		<div>
        {account &&
        <div style={{minHeight:"85vh"}}>
            <Grid>
                <Grid.Col sm={3}><h1 style={{marginLeft:"2%"}}>Profile</h1></Grid.Col>
            </Grid>
            <hr></hr>
            <Grid>
                {!editProfile &&
                <>
                    <Grid.Col sm={4}>
                        <div style={{margin:"2% 0%"}}>
                            {!avatar && <CgProfile size="2em"/>}
                            {avatar && <img src={avatar}  ></img>}
                        </div>
                        <h4>Username: {username}</h4>
						<p>Name: {firstName} {lastName}</p>
                        <p>Bio: {bio}</p>
                            {twitterHandle && 
                            <span ><Link href={"https://twitter.com/"+ twitterHandle} target="_blank"><FiTwitter></FiTwitter></Link></span>
                        }
                        {link && 
                            <span ><Link href={link} target="_blank"><FiGlobe></FiGlobe></Link></span>
                        }
                        <br></br>
                        <Button onClick={handleEditPressed} style={{margin:"0% 1%!important", backgroundColor:"lightblue"}} size="xs">Edit Profile <FiEdit2 style={{marginLeft:"5px"}}/></Button>
                        
                    </Grid.Col>
                </>
                }
                {editProfile && account && 
                <>
                    <Grid.Col sm={2}></Grid.Col>
                    <Grid.Col sm={8}>
                         <div style={{margin:"2% 43%"}}>
                           {!avatar && <CgProfile size="2em"/>}
                            {avatar && <img src={avatar} ></img>}
                        </div>
                        <Formik
                            initialValues={{avatar: avatar, username: username, bio: bio, twitterHandle: twitterHandle, link: link}} 
                            validateOnChange={false}
                            validateOnBlur={false}
                            onSubmit={(_, actions) => {
                            formSubmit(actions);
                            }}
                        >
                            {(props) => (
                            <Form style={{ width: "100%" }} >
                                <Box mb={4}>
                                    {
                                        <Field name="avatar">
                                        {() => (
                                        <>
                                            <Text>Avatar:</Text>
                                            <Input size="xs"
                                            value={undefined} 
                                            type="file" 
                                            accept="image/*"
                                            onChange={async(e:any) => {
                                                const file = (e.target.files[0])
                                                setAvatarFile(file);
                                            }}
                                            />
                                        </>
                                        )}
                                    </Field>
                                    }
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
                                <Field name="email">
                                    {() => (
                                    <>
                                        <Text><FiMail></FiMail>Email:</Text>
                                        <Input
                                        value={email}
                                        onChange={(e:any) => setEmail(e.target.value)}
                                        placeholder={email || "email"}
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
                                        <Text><FiTwitter></FiTwitter></Text>
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
                                        <Text><FiGlobe></FiGlobe></Text>
                                        <Input size="xs"
                                        value={link}
                                        onChange={(e:any) => setLink(e.target.value)}
                                        placeholder={link}
                                        />
                                    </>
                                    )}
                                </Field>
                                <div  style={{display:"inline", margin:"5% 0!important"}}>
                                    <Button type="submit" style={{margin:"0 20%"}}>Save<FiEdit2 style={{marginLeft:"5px", display:"inline"}}/></Button>
                                    <Button type="button" onClick={handleCancelPressed} style={{margin:"0 2%", display:"inline"}}>Cancel</Button>
                                </div>
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

