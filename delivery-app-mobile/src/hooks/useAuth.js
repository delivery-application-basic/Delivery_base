/**
 * useAuth - Auth state and actions from Redux
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  login as loginAction,
  register as registerAction,
  logout as logoutAction,
  loadUserFromStorage,
  clearError,
} from '../store/slices/authSlice';
import { USER_TYPES } from '../utils/constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const {
    user,
    token,
    userType,
    isAuthenticated,
    isLoading,
    error,
  } = useSelector((state) => state.auth);

  const login = useCallback(
    async (credentials) => {
      const { phone, email, password, userType: type } = credentials;
      return dispatch(
        loginAction({
          phone: phone || null,
          email: email || null,
          password,
          userType: type || USER_TYPES.CUSTOMER,
        })
      ).unwrap();
    },
    [dispatch]
  );

  const register = useCallback(
    async (userType, registrationData) => {
      return dispatch(
        registerAction({ userType, registrationData })
      ).unwrap();
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    return dispatch(logoutAction()).unwrap();
  }, [dispatch]);

  const loadUser = useCallback(() => {
    return dispatch(loadUserFromStorage()).unwrap();
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    userType,
    isAuthenticated: !!isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loadUser,
    clearAuthError,
  };
};

export default useAuth;
