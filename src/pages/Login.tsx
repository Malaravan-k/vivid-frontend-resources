import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { dispatch } from '../store';
import { sessionActions } from '../store/actions/session.actions';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import LoginWrapper from './LoginWrapper';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import IconImage from '../assets/voxlaneLogo.png';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { error } = useAuth();
  const { loading } = useSelector((state: RootState) => state.sessionReducer);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  return (
    <LoginWrapper>
      <div className="flex items-center justify-center min-h-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl ">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center p-2 rounded-full">
              <img className="w-20 h-20" src={IconImage} alt="Company Logo" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-center text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-center text-gray-600">
              Please enter your credentials to access your account
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
                <div className="space-y-4">
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
                      className="px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {touched.username && errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

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
                      className="px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                    {touched.password && errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    className="w-full px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 rounded-lg shadow-sm"
                    isLoading={loading}
                  >
                    Sign In
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