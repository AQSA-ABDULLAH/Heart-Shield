import LoginModal from "../../login-model/Login";
import { useRedirectIfAuthenticated } from "../../utils/useRedirect";

const Login = ({ isauth }) => {
  useRedirectIfAuthenticated(isauth);
  return (
    <div>
      <LoginModal />
    </div>
  );
};

export default Login;