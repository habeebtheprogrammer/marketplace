import "./Header.css";
import { CgHeart,  CgChevronDown } from "react-icons/cg";
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import { GrSearch } from "react-icons/gr";
import { useData } from "../../contexts/DataProvider.js";
import { useAuth } from "../../contexts/AuthProvider.js";
import { CgShoppingCart } from "react-icons/cg";
import { useUserData } from "../../contexts/UserDataProvider.js";
import { PromoModal } from "../PromoModal/PromoModal.jsx";
import { SigninModal } from "../SigninModal/SigninModal.jsx";
import { gaTrackEvent } from "../../utils/analytics.js";
import Countdown from "react-countdown";
import moment from "moment/moment.js";
import { RiFireFill } from "react-icons/ri";

export const Header = () => {
  const { auth, setIsLoginModalOpen } = useAuth();
  const { state: {promo} } = useData();
  const navigate = useNavigate();
  const { userDataState } = useUserData();
  const [showHamburger, setShowHamburger] = useState(true);
  const [search, setSearch] = useState('')
  const submit  = (e) => {
    e.preventDefault();
    gaTrackEvent({type: 'Search', label: 'Search', data: {title: search}})
    window.fbq('track', 'Search');
    navigate("/product-listing?title="+ search)

  }
  const getActiveStyle = ({ isActive }) => {
    return { color: isActive ? "grey" : "grey" };
  };

  const totalProductsInCart = userDataState.cartProducts?.reduce(
    (acc, curr) => {
      return acc + curr.qty;
    },
    0
  );
  const isProductInCart = () => (Number(totalProductsInCart) ? true : false);

  const totalProductsInWishlist = userDataState.wishlistProducts.length;

  const isProductInWishlist = () =>
    Number(totalProductsInWishlist) ? true : false;
  return (
    <div className="x-nav">
    {promo?.priceDrop && <div className="x-flash-sale">
      <p><RiFireFill  /> Massive price drop ends in <Countdown  zeroPadTime={1} zeroPadDays={1} date={moment('2024-09-2T00:00:00').format('YYYY-MM-DD')} />s</p>
      </div>}
      <nav>
        
        <div className="nav-logo-home-button">
          <NavLink style={getActiveStyle} to="/">
            <img
              src="https://res.cloudinary.com/dzvhmiutm/image/upload/v1723338006/logo_qt3of8.png"
              alt="360gadgets"
              className="logo-image"
            />
            <span className="brand-name"></span>
          </NavLink>
        </div>

        <div className="nav-input-search">
        <input
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            e.key === "Enter" && submit(e)
          }}
          placeholder="Search"
        />
        <button onClick={submit}>
          <GrSearch  color="#000"/>
        </button>
      </div> 
  <div>
  </div>
        <div
          className={
            !showHamburger
              ? "nav-link-container-mobile nav-link-container"
              : "nav-link-container"
          }
        >
       

          <NavLink
            onClick={() => setShowHamburger(true)}
            style={getActiveStyle}
            to="/product-listing"
          >
            Explore
          </NavLink>
          <NavLink
             onClick={() => {
              setShowHamburger(true)
              !auth.isAuth &&  setIsLoginModalOpen(true)
            }}
            style={getActiveStyle}
            to={auth.isAuth ? "/swap" : "#"}
          >
            Swap deals
          </NavLink>
          {/* <NavLink
            onClick={() => setShowHamburger(true)}
            style={getActiveStyle}
            to="/contact-us"
          >
            Contact us
          </NavLink> */}
          {/* <NavLink
            onClick={() => setShowHamburger(true)}
            style={getActiveStyle}
            to="/return-policy"
          >
            Return policy
          </NavLink> */}
          {/* <NavLink
          onClick={() => setShowHamburger(true)}
          style={getActiveStyle}
          to="/product-listing"
        >
          Pre Launch Freebie
        </NavLink> */}
          <NavLink
            onClick={() => {
              setShowHamburger(true)
              !auth.isAuth &&  setIsLoginModalOpen(true)
            }}
            style={getActiveStyle}
            to={auth.isAuth ? "/profile" : "#"}
          >
            <span>
              {!auth.isAuth ? "Login" : "Profile"}
            </span>

          </NavLink>
          <NavLink
           onClick={() => {
            setShowHamburger(true)
            !auth.isAuth &&  setIsLoginModalOpen(true)
          }}
            style={getActiveStyle}
            to="wishlist"
          >
            <span>{!showHamburger ? "Wishlist" : ""}</span>
            <div>
              <CgHeart size={25} className="wishlist" />{" "}
              {isProductInWishlist() && (
                <span className="cart-count cart-count-mobile">
                  {totalProductsInWishlist}
                </span>
              )}
            </div>
          </NavLink>
          <NavLink
        onClick={() => {
          setShowHamburger(true)
          !auth.isAuth &&  setIsLoginModalOpen(true)
        }}
            style={getActiveStyle}
            to="/cart"
          >
            <span>{!showHamburger ? "Cart" : ""}</span>
            <div>
              <CgShoppingCart size={25} className="cart" />{" "}
              {isProductInCart() && (
                <span className="cart-count cart-count-mobile">
                  {" "}
                  {totalProductsInCart}{" "}
                </span>
              )}
            </div>
          </NavLink>
          <NavLink
          // onClick={() => setShowHamburger(true)}
          className="x-country"
          style={getActiveStyle}
          to="#"
        >
          🇳🇬 NGN <CgChevronDown />
        </NavLink>
        
    
        
        </div> 
        {showHamburger && (
          <div className="x-right-container">
              {/* <NavLink
          className="hamburger-icon"
          onClick={() => {
            setShowHamburger(true)
            !auth.isAuth &&  setIsLoginModalOpen(true)
          }}
          style={getActiveStyle}
          to={auth.isAuth ? "/swap" : "#"}
          
        >
          Swap deal 
        </NavLink> */}
          <div className="hamburger-icon border" onClick={() => setShowHamburger(false)}>
            <RxHamburgerMenu size={20} />
          </div>
          </div>
        )}
        {!showHamburger && (
          <div
            className="cross-tab-icon cross-tab-icon-mobile"
            onClick={() => setShowHamburger(true)}
          >
            <RxCross2 color={"rgb(106, 106, 65)"} size={25} />
          </div>
        )}
      </nav>
      {!localStorage.getItem('token') && <PromoModal />}
      <SigninModal />
    </div>
  );
};
