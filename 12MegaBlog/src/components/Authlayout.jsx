import React,{useEffect, useState} from 'react'
import {useSelector} from "react-redux"
import {useNavigate} from "react-router-dom"

export default function Protected({children,authentication= true}) {
    const navigate=useNavigate()
    const authState=useSelector((state) => state.auth)
    const [isLoading,setIsLoading]=useState(true)

    useEffect(() => {
        if (authentication && authState.status !== authentication) {
            navigate("/login")
        }else if(!authentication && authState.status !== authentication){
            navigate("/")
        }
        setIsLoading(false)
    }, [authState, navigate, authentication])
  return  isLoading ? <h1>Loading....</h1> : <>{children}</>
   
  
}


