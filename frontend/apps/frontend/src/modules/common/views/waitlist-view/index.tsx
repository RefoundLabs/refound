// import { useAccount } from "@modules/account/hooks/use-auth";
import { ContentSection } from "@modules/ui/content-section";
import { cloin } from "@utils/styling/cloin";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { config } from "@config/config";
import axios from "axios";
import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
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
import { Field, Form, Formik } from "formik";
import NextLink from 'next/link';
export const WaitListView: NextPage = () => {
	const router = useRouter();
	const [submitted , setSubmitted ] = useState();
  const [username , setUsername ] = useState();
	const [email , setEmail ] = useState();
	const [firstname , setFirstName ] = useState();
  const [lastname , setLastName ] = useState();
  const [twitterHandle , setTwitterHandle ] = useState();
  const [link , setLink ] = useState();
	const [alert , setAlert ] = useState("");
  const [success , setSuccess ] = useState("");
  const [userInWaitlist, setUserInWailist] = useState(false);

	const formSubmit = (actions: any) => {
		actions.setSubmitting(false);
	
		//reegister with email and fullname
    createUser();
	  };

    useEffect(() => {
      if (username){
        console.log(username);
        getUser();
      }
      if(userInWaitlist){
        setAlert("User in waitlist already");
      }
    }, [username, email, firstname, lastname, twitterHandle, link]); 

    const getUser = async() => {
      if(username){
          console.log(username);
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
              setUserInWailist(true);
          })
          .catch((error) => {
              console.log(error);
          });
          //console.log(res);
      }
    }

    const createUser = async () => {
      console.log('create user fired')
      if(username && firstname && email ){
          const res = await axios
          .post(
            "/api/waitlist",
            { username, email, firstname, lastname, twitterHandle, link },
            {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            }).then(async () => {
              //redirectToHome();
              setSuccess("Succesfully signed up!");
          }).catch((error:any) => {
              console.log(error);
              console.log('-error-')
              setAlert(error.response.data.error);
          });
          console.log(res);
      }
    };


	return (
		<ContentSection width="xs" className="flex flex-col items-center gap-12">
			<div className="w-full pt-16 pb-4">
				<h1 className="text-4xl font-bold text-center">Sign Up For Our Waitlist</h1>
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
                
                <>
                <Field name="username">
                    {() => (
                     <>
                        <Text>Username: <em style={{fontSize:"0.5em", color: "grey"}}>choose a handle like Rob.Refound or create your own username</em></Text>
                        <Input
                          value={username} style={{marginBottom:"10px"}}
                          onChange={(e:any) => setUsername(e.target.value)}
                          placeholder="Username"
                        />
                       </>
                    )}
                  </Field>
                  <Field name="email">
                    {() => (
                     <>
                        <Text>Email:</Text>
                        <Input
                          value={email} style={{marginBottom:"10px"}}
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
                          value={firstname} style={{marginBottom:"10px"}}
                          onChange={(e:any) => setFirstName(e.target.value)}
                          placeholder="First Name"
                        />
                       </>
                    )}
                  </Field>
                  <Field name="lastname">
                    {() => (
                      <>
                        <Text>Last Name:<em style={{fontSize:"0.5em", color: "grey"}}>optional</em></Text>
                        <Input
                          value={lastname}  style={{marginBottom:"10px"}}
                          onChange={(e:any) => setLastName(e.target.value)}
                          placeholder="Last Name"
                        />
                       </>
                    )}
                  </Field>
                  <Field name="twitterHandle">
                    {() => (
                      <>
                        <Text>Twitter Handle:<em style={{fontSize:"0.5em", color: "grey"}}>optional</em></Text>
                        <Input
                          value={twitterHandle}  style={{marginBottom:"10px"}}
                          onChange={(e:any) => setTwitterHandle(e.target.value)}
                          placeholder="Twitter Handle"
                        />
                       </>
                    )}
                  </Field>
                  <Field name="link">
                    {() => (
                      <>
                        <Text>Other Link:<em style={{fontSize:"0.5em", color: "grey"}}>other social media, medium, substack, or a link to your creative work.</em></Text>
                        <Input
                          value={link}  style={{marginBottom:"10px"}}
                          onChange={(e:any) => setLink(e.target.value)}
                          placeholder="Other Link"
                        />
                       </>
                    )}
                  </Field>
                  
                    <div style={{ textAlign:"center"}}>
                      <Button
                        mt={12}  
                        type="submit" style={{backgroundColor:"black", width:"100%"}}
                      >Submit
                      </Button>
                    </div>
                  </>
                  
                  {userInWaitlist &&
                    <Button style={{backgroundColor:"black", width:"100%", marginTop:'10px'}}><NextLink href="/profile"><a>Go To Your Profile</a></NextLink></Button>
                  }
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
