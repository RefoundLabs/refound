import { ContentSection } from "@modules/ui/content-section";
import { useAccount } from "@modules/account/hooks/use-account";
import { useNear } from "@modules/account/hooks/use-near";
import { cloin } from "@utils/styling/cloin";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {signOut, useSession } from "next-auth/react"
import {signIn as SignIn} from "next-auth/react"; 
import type { NextPage } from 'next'
import NextLink from 'next/link';
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
import { userAgent } from 'next/server';
import axios from "axios";
import AxiosResponse from "axios";


export const SignUpView = () => {

	const router = useRouter();
	const [submitted , setSubmitted ] = useState();
	const [email , setEmail ] = useState();
	const [firstname , setFirstName ] = useState();
	const [username, setUsername] = useState("");
	const [lastname , setLastName ] = useState();
	const [twitterHandle , setTwitterHandle ] = useState();
	const [link , setLink ] = useState();
	const [alert , setAlert ] = useState("");
	const [success , setSuccess ] = useState("");

	const formSubmit = (actions: any) => {
		actions.setSubmitting(false);

		//reegister with email and fullname
			createUser();
		};


	const createUser = async () => {
		console.log('create newsletter fired')
		if(username && firstname && lastname && email && twitterHandle && link){
			const res = await axios
			.post(
				"/api/waitlist",
				{ username , firstname , lastname, email, twitterHandle, link },
				{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				}
			)
			.then(async () => {
				//redirectToHome();
				setSuccess("Succesfully signed up!");
        router.push("/profile");
			}) 
			.catch((error:any) => {
				console.log(error);
				setAlert(error);
			});
			console.log(res);
		}
	};

	return (
		<ContentSection width="sm" className="flex flex-col items-center gap-12">
			<ul className="steps">
				<li className={`step step-neutral`}>
					<span className="text-xs font-bold tracking-wide px-[1em]">
						Connect Your Wallet
					</span>
				</li>
				<li className={`step step-neutral`}>
					<span className="text-xs font-bold tracking-wide px-[1em]">
						Create Your Profile
					</span>
				</li>
			</ul>

			<h1 className="text-2xl font-bold">Create Your Account</h1>

			


		<div className="w-full pt-16 pb-4">
			<Formik
            initialValues={{}} // { email: "", password: "" }
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={(_, actions) => {
              formSubmit(actions);
            }}
          >
            {(props) => (
              <Form style={{ width: "100%" }}>
                <Box mb={4}>
                  <Field name="email">
                    {() => (
                     <>
                        <Text>Email:</Text>
                        <Input
                          value={email}
                          onChange={(e:any) => setEmail(e.target.value)}
                          placeholder="Email Address"
                        />
                       </>
                    )}
                  </Field>
                  <Field name="firstname">
                    {() => (
                      <>
                        <Text>First Name:</Text>
                        <Input
                          value={firstname}
                          onChange={(e:any) => setFirstName(e.target.value)}
                          placeholder="First Name"
                        />
                       </>
                    )}
                  </Field>
                  <Field name="lastname">
                    {() => (
                      <>
                        <Text>Last Name:</Text>
                        <Input
                          value={lastname}
                          onChange={(e:any) => setLastName(e.target.value)}
                          placeholder="Last Name"
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
                  <Field name="twitterHandle">
                    {() => (
                      <>
                        <Text>Twitter Handle:</Text>
                        <Input
                          value={twitterHandle}
                          onChange={(e:any) => setTwitterHandle(e.target.value)}
                          placeholder="Twitter Handle"
                        />
                       </>
                    )}
                  </Field>
                  <Field name="link">
                    {() => (
                      <>
                        <Text>Other Link:</Text>
                        <Input
                          value={link}
                          onChange={(e:any) => setLink(e.target.value)}
                          placeholder="Other Link"
                        />
                       </>
                    )}
                  </Field>
                  <Button
                    mt={6} 
                    type="submit" style={{backgroundColor:"green"}}
                  >Submit
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
         {alert && <Alert color={"red"} style={{marginTop:"5%"}}>{alert}</Alert>}
         {success && <Alert color={"green"} style={{marginTop:"5%"}}>{success}</Alert>}
			</div>


			<div className="mx-auto prose-sm prose text-center">
				<p>
					Powered by{" "}
					<NextLink href="https://near.org/">
						<a target="_blank">Near</a>
					</NextLink>
				</p>
			</div>

		</ContentSection>
	);
};
