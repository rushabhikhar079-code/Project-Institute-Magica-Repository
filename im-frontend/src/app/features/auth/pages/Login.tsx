import LoginForm from "../components/LoginForm";
import type { LoginProps } from "../types";

const Login = ({ onForgotPassword, onRequestDemo }: LoginProps) => {
  return (
    <LoginForm
      onForgotPassword={onForgotPassword}
      onRequestDemo={onRequestDemo}
    />
  );
};

export default Login;