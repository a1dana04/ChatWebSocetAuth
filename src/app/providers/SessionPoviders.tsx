"use client"
import React, { FC, ReactNode } from 'react'
import { SessionProvider as NextAuthProvider } from "next-auth/react"
import { Session } from 'next-auth'




interface ISessionProvidersProps {
    children:ReactNode
    session:Session | null

}

const SessionPoviders:FC<ISessionProvidersProps> = ({children,session}) => {
  return (
   <NextAuthProvider session={session}>{children}</NextAuthProvider>
  )
}

export default SessionPoviders