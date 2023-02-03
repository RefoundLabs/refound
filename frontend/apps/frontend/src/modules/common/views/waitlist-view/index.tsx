// import { useAccount } from "@modules/account/hooks/use-auth";
import { ContentSection } from "@modules/ui/content-section";
import { cloin } from "@utils/styling/cloin";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { config } from "@config/config";
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
export const WaitListView: NextPage = () => {
	const router = useRouter();
	const [submitted , setSubmitted ] = useState();
	const [email , setEmail ] = useState();
	const [firstname , setFirstName ] = useState();
  const [lastname , setLastName ] = useState();
  const [twitter , setTwitter ] = useState();
	const [alert , setAlert ] = useState();

	const formSubmit = (actions: any) => {
		actions.setSubmitting(false);
	
		//reegister with email and fullname
	  };

	return (
		<ContentSection width="xs" className="flex flex-col items-center gap-12">
			{!submitted &&
			<>
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
                        <Text>Full Name:</Text>
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
                  <Field name="twitter">
                    {() => (
                      <>
                        <Text>Twitter:</Text>
                        <Input
                          value={twitter}
                          onChange={(e:any) => setTwitter(e.target.value)}
                          placeholder="Twitter Handle"
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
			</div>


			<div className="mx-auto prose-sm prose text-center">
				<p>
					Powered by{" "}
					<NextLink href="https://near.org/">
						<a target="_blank">Near</a>
					</NextLink>
				</p>
			</div>
			</>
			}
			{submitted && 
				<div>
					<p>Thank you for registering your interest in Refound. Over the coming months, we'll be rolling out features as we prepare this platform for launch.</p>
				</div>
			}
		</ContentSection>
	);

};
