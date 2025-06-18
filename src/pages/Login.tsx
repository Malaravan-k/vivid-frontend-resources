import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { dispatch } from '../store';
import { sessionActions } from '../store/actions/session.actions';
import { Formik, Form, } from 'formik';
import * as Yup from 'yup';
import LoginWrapper from './LoginWrapper';
import { useSelector } from 'react-redux';
import {RootState} from '../store/index'
import IconImage from '../assets/Voxlane_logo.png'

const Login = () => {
  const navigate = useNavigate();
  const { error } = useAuth();
  const {loading} = useSelector((state: RootState)=>state.sessionReducer)

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Validation schema with Yup
  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  return (
    <LoginWrapper>
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-md w-full space-y-8 ">
        <div>
          <div className="mx-auto  rounded-full bg-white flex gap-2 items-center justify-center text-white font-bold text-lg">
            <img className="w-16 h-16" src={IconImage} alt="Icon" />
            {/* <p className='text-[#0095FF] text-3xl '>Voxlane</p> */}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access the dashboard
          </p>
        </div>

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            dispatch(sessionActions.login(values.username, values.password, navigate));
          }}
        >
          {({ handleChange, handleBlur, values, touched, errors }) => (
            <Form className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm space-y-4">
                {/* Username Field */}
                <div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    label="Username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.username && errors.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* Password Field with Eye Icon */}
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    label="Password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {/* Eye Icon button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      // Eye-off icon (simple SVG)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5 0-9-3.5-9-7s4-7 9-7a10.06 10.06 0 0 1 5.94 2.06"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      // Eye icon (simple SVG)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>

                  {touched.password && errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Global error from auth */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Button type="submit" className="w-full" isLoading={loading}>
                  Sign in
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
    </LoginWrapper>
  );
};

export default Login;
