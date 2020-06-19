import React from "react";
import ApplicationState from "../../../../core/application-state";
import { connect } from "react-redux";
import { loginAccount, setAuthenticationStep } from "../../redux/account-actions";
import { AuthenticationStep } from "../../redux/account-types";
import VaultLoginPresentation from "./vault-login-presentation";

interface Props {
  authenticationStep: AuthenticationStep;
  loginAccount: typeof loginAccount;
  setAuthenticationStep: typeof setAuthenticationStep;
}

const VaultLogin: React.FunctionComponent<Props> = (props) => {
  const login = () => {
    props.setAuthenticationStep(AuthenticationStep.VAULT_IN_PROGRESS);
    props.loginAccount();
  };

  return <VaultLoginPresentation authenticationStep={props.authenticationStep} login={login} />;
};

const mapDispatchToProps = {
  loginAccount,
  setAuthenticationStep
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    authenticationStep: store.account.authenticationStep
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VaultLogin);