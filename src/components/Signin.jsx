import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';


const SignIn = () => {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState("");

const {session, signInUser} = UserAuth();
const navigate = useNavigate()
console.log(session);

const handleSignIn = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const result = await signInUser(email, password);

    if (result.success) {
      navigate('/garage');
    }
  } catch (err) {
    setError("an error occurred");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <form onSubmit={handleSignIn} className="max-w-md m-auto pt-24">
            <h2 className="font-bold pb-2 text-black dark:text-white">Sign in!</h2>
            <p className="text-black dark:text-white">Don't have an account? <Link to="/signup" className="text-blue-600 dark:text-blue-400">Sign up!</Link></p>
            <div className="flex flex-col py-4">
                <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-3 mt-6 bg-amber-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" type="email" />
                <input onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="p-3 mt-6 bg-amber-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" type="password" />
                <button type="submit" disabled={loading}  className="mt-4 w-full bg-gray-800 dark:bg-gray-700 text-white dark:text-white hover:bg-gray-700 dark:hover:bg-gray-600">Sign In</button>
                {error && <p className="text-red-600 dark:text-red-400 text-center pt-4">{error}</p>}
            </div>
        </form>
    </div>
  )
}

export default SignIn