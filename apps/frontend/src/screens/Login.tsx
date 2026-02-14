import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { userAtom } from '@repo/store/userAtom';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

const Login = () => {
  const navigate = useNavigate();
  const guestName = useRef<HTMLInputElement>(null);
  const [_, setUser] = useRecoilState(userAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const google = () => {
    window.open(`${BACKEND_URL}/auth/google`, '_self');
  };

  const github = () => {
    window.open(`${BACKEND_URL}/auth/github`, '_self');
  };

  const loginAsGuest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const name = (guestName.current && guestName.current.value) || '';
      if (!name.trim()) {
        setError('Please enter a username');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to login as guest');
      }

      const user = await response.json();
      setUser(user);
      navigate('/game/random');
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-textMain">
      <h1 className="text-4xl font-bold mb-8 text-center text-green-500 drop-shadow-lg">Enter the Game World</h1>
      <div className="bg-bgAuxiliary2 rounded-lg shadow-lg p-8 flex flex-col md:flex-row">
        <div className="mb-8 md:mb-0 md:mr-8 justify-center flex flex-col border-b md:border-b-0 md:border-r border-gray-700 pb-8 md:pb-0 md:pr-8">
          <div
            className="flex items-center justify-center px-4 py-2 rounded-md mb-4 cursor-pointer transition-colors hover:bg-gray-600 duration-300 bg-gray-700/50"
            onClick={google}
          >
            <img src="google.svg" alt="" className="w-6 h-6 mr-2" />
            Sign in with Google
          </div>
          <div
            className="flex items-center justify-center px-4 py-2 rounded-md cursor-pointer hover:bg-gray-600 transition-colors duration-300 bg-gray-700/50"
            onClick={github}
          >
            <img src="github.svg" alt="" className="w-6 h-6 mr-2" />
            Sign in with Github
          </div>
        </div>
        <form className="flex flex-col items-center md:ml-8" onSubmit={loginAsGuest}>
          <div className="flex items-center mb-4">
            <div className="bg-gray-600 h-px w-10 mr-2"></div>
            <span className="text-gray-400 text-sm font-medium">OR GUEST</span>
            <div className="bg-gray-600 h-px w-10 ml-2"></div>
          </div>
          <input
            type="text"
            ref={guestName}
            placeholder="Username"
            disabled={isLoading}
            className="bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-md mb-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-gray-500"
          />
          {error && <p className="text-red-400 text-xs mb-4 w-full text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all duration-300 flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              'Enter as guest'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
