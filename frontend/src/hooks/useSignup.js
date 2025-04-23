import { useAuthContext } from './useAuthContext'
import { useState } from 'react'
export const useSingup = () => {
    const [Error, setError] = useState(null)
    const [Loading, setLoading] = useState(null)
    const { dispatch } = useAuthContext();



    const signup = async (user) => {
        setLoading(true)
        setError(null)

        const response = await fetch("/users/register"
            , {
                method: "POST",
                headers: { "content-Type": "application/json" },
                body: JSON.stringify(user)
            })
        const json = response.json()
        if (!response.ok) {
            setLoading(false)
            setError(json.then(d => (d.error)))
            console.log(json)
            console.log(Error)
        }

        if (response.ok) {
            //save user in storage
            localStorage.setItem('user', JSON.stringify(json))
            //update AUTH CONTEXT
            dispatch({ type: 'LOGIN', payload: json })
            setLoading(false)
            console.log(json)
        }


    }

    return { signup, Loading, Error }

}
