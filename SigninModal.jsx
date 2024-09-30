import "./SigninModal.css";
import React from "react";

import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";
import AppleSignin from 'react-apple-signin-auth';
import { RiAppleFill, RiGoogleLine, RiMailLine, RiMessageLine } from "react-icons/ri";
import { CgGoogle } from "react-icons/cg";
import { useAuth } from "../../contexts/AuthProvider";
import { GoogleLogin , useGoogleLogin} from "@react-oauth/google";
export const SigninModal = () => {
  // const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate()
  const { error, setError, loginCredential, setLoginCredential, loginHandler ,isLoginModalOpen, setIsLoginModalOpen} =
    useAuth();
    // const oauthLogin = useGoogleLogin({
    //   // redirect_uri: "https://360gadgetsafrica.com/signin",
    //   onNonOAuthError: (err)=> console.log(err),
    //   onSuccess: (tokenResponse) => {
    //     loginHandler({ oauthToken: tokenResponse?.access_token })
    //     },
    //     hosted_domain: "https://360gadgetsafrica.com",
    //   onError: err => console.log(err) 
    // })

  return (
    isLoginModalOpen &&
    <div className="signin-modal-container">
      <div className="signin-input-container">
        <div className="signin-content">
        
          <div className="signin-details">
            <h2>Login or signup in seconds</h2>
            <p className="x-subtitle">Create an account or signin to use 360gadgetsafrica, save your
              carts, wishlists and orders by signin in</p>

            <center>
            <GoogleLogin
            width={"250px"}
            useOneTap={true}
            auto_select={true}
            theme="filled_blue"
            ux_mode="popup" 
            onSuccess={credentialResponse => {
              loginHandler({ oauthToken: credentialResponse.credential })
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />
              <br />
              Or
            </center>
              <button className="x-email" onClick={() => {
              setIsLoginModalOpen(false)
              navigate("/signup")
            }}>
              <RiMailLine />  Continue with Email
            </button>
            {/* <button className="x-google" onClick={oauthLogin} >
              <CgGoogle /> Continue with Google
            </button> */}
           
            <AppleSignin
              /** Auth options passed to AppleID.auth.init() */
              authOptions={{
                /** Client ID - eg: 'com.example.com' */
                clientId: 'com.gadgetsafrica.gadgetsafrica',
                /** Requested scopes, seperated by spaces - eg: 'email name' */
                scope: 'email name',
                /** Apple's redirectURI - must be one of the URIs you added to the serviceID - the undocumented trick in apple docs is that you should call auth from a page that is listed as a redirectURI, localhost fails */
                redirectURI: 'https://360gadgetsafrica.com/oauth/success',
                /** State string that is returned with the apple response */
                state: 'state',
                /** Nonce */
                nonce: 'nonce',
                /** Uses popup auth instead of redirection */
                usePopup: true,
              }} // REQUIRED
              /** General props */
              uiType="dark"
              /** className */
              className="apple-auth-btn"
              /** Removes default style tag */
              noDefaultStyle={false}
              /** Allows to change the button's children, eg: for changing the button text */
              buttonExtraChildren="Continue with Apple"
              /** Extra controlling props */
              /** Called upon signin success in case authOptions.usePopup = true -- which means auth is handled client side */
              onSuccess={(response) =>   loginHandler({ appleToken:  response})} // default = undefined
              /** Called upon signin error */
              onError={(error) => console.error(error)} // default = undefined
              /** Skips loading the apple script if true */
              skipScript={false} // default = undefined
              /** Apple image props */
              iconProp={{ style: { marginTop: '10px' } }} // default = undefined
              /** render function - called with all props - can be used to fully customize the UI by rendering your own component  */
              render={(props) => <button {...props} style={{"color": "#000"}}> <RiAppleFill /> Continue with Apple</button>}
            />


            <div className="x-foot">
              <p> By continuing. vou agree to 360gadgetsafrica <Link to="/terms">Terms of use</Link>. Read
                our <Link to="privacy" >Privacy Policy</Link></p>
            </div>
          </div>
          <div
            className="cross-tab-icon cross-tab-icon-mobile"
            onClick={() => setIsLoginModalOpen(false)}
          >
            <RxCross2 color={"rgb(106, 106, 65)"} size={25} />
          </div>
          <div>
          </div>
        </div>
      </div>
    </div>
  );
};
