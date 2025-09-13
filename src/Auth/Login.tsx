// src/pages/Login.tsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Logged in:", userCredential.user);
      localStorage.setItem("userEmail", userCredential.user.email || "");
      navigate("/"); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const errorVariants = {
    hidden: { x: 0 },
    visible: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } },
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <motion.form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-96"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white"
          variants={itemVariants}
        >
          Login
        </motion.h2>

        {error && (
          <motion.p
            className="mb-4 text-red-500 text-sm text-center"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
          >
            {error}
          </motion.p>
        )}

        <motion.input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          required
          variants={itemVariants}
        />

        <motion.input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          required
          variants={itemVariants}
        />

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          )}
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        <motion.p
          className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300"
          variants={itemVariants}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            Sign Up
          </Link>
        </motion.p>
      </motion.form>
    </div>
  );
}
