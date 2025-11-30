import LoginModal from "../../components/LoginModel/LoginModal";
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