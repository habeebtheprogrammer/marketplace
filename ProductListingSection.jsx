import "./ProductListingSection.css";
import Tilt from "react-parallax-tilt";
import React from "react";

import { useData } from "../../../../contexts/DataProvider.js";
import { Link } from "react-router-dom"; 
import { AiOutlineHeart } from "react-icons/ai";
import { AiTwotoneHeart } from "react-icons/ai";
import { useUserData } from "../../../../contexts/UserDataProvider.js";

import { BsFillStarFill } from "react-icons/bs";

export const ProductListingSection = () => {
  const { state, getAllProducts, dispatch, loading} = useData();
  const {listDisplayType} = useUserData();
  
  const {
    isProductInCart,
    isProductInWishlist,
    wishlistHandler,
    addToCartHandler,
    cartLoading,
  } = useUserData();

  const {
    allProductsFromApi,
    inputSearch,
    filters: { rating, categories, price, sort },
  } = state;

  // const searchedProducts = getSearchedProducts(allProductsFromApi, inputSearch);

  // const ratedProducts = getRatedProducts(searchedProducts, rating);

  // const categoryProducts = getCategoryWiseProducts(ratedProducts, categories);

  // const pricedProducts = getPricedProducts(categoryProducts, price);

  // const sortedProducts = getSortedProducts(pricedProducts, sort);
  return (
    <div>
    <div className={`product-card-container ${listDisplayType }`}>
      {!allProductsFromApi?.data?.length ? (
      
         <div className="no-products-found">
         <h2 className="page-heading">Hang tight! These amazing products are coming soon!</h2>
         <button
           className="explore-btn"
           onClick={() =>  dispatch({
            type: "RESET",
            payload: {
              rating: "",
              categories: [],
              price: [],
              sort: "",
            },
          })}
         >
           Explore others
         </button>
       </div>
      ) : (
        allProductsFromApi?.data?.map((product) => {
          const {
            _id,
            id,
            title,
            original_price,
            discounted_price,
            categoryId,
            is_stock,
            rating,
            reviews,
            trending,
            images,
            slug
          } = product;

          return (
            
            <Tilt
              key={product._id}
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              glareEnable={false}
              transitionSpeed={2000}
              scale={1.02}
            >
              <div className="product-card" key={_id}>
             
              <Link to={`/product-details/${slug}`}>
                  <div className="product-card-image">
                    <Tilt
                      transitionSpeed={2000}
                      tiltMaxAngleX={15}
                      tiltMaxAngleY={15}
                      scale={1.08}
                    >
                      <img src={images[0]} alt="" />
                    </Tilt>
                  </div>

                <div className="product-card-details">
                  <h3>{title}</h3>
                  <p className="ratings">
                    {rating["$numberDecimal"]}
                    <BsFillStarFill color="orange" /> ({reviews} reviews){" "}
                  </p>
                  <div className="price-container">
                    <p className="original-price">₦{original_price}</p>
                    <p className="discount-price">₦{discounted_price}</p>
                  </div>

                  <p>Genre: {categoryId?.title}</p>
                  <div className="info">
                    {is_stock ? <p className="in-stock">{is_stock} in stock</p> :  <p className="out-of-stock">Out of stock</p> }
                    {trending && <p className="trending">🔥 Trending</p>}
                  </div>
                
                </div>
                </Link>
                <div className="x-rel">
                <button
                    onClick={() => wishlistHandler({productId: product._id, title: product.title})}
                    className="wishlist-btn"
                  >
                    {!isProductInWishlist(product?._id) ? (
                      <AiOutlineHeart size={30} />
                    ) : (
                      <AiTwotoneHeart
                        AiTwotoneHeartFill
                        color="red"
                        size={30}
                      />
                    )}
                  </button>
                </div>

                <div className="product-card-buttons">
                  {/* <button
                    disabled={cartLoading}
                    onClick={() => addToCartHandler(product)}
                    className="cart-btn"
                  >
                    {!isProductInCart(product) ? "Add To Cart" : "Go to Cart"}
                  </button> */}
                  {/* <button
                    onClick={() => wishlistHandler({productId: product._id, title: product.title})}
                    className="wishlist-btn"
                  >
                    {!isProductInWishlist(product?._id) ? (
                      <AiOutlineHeart size={30} />
                    ) : (
                      <AiTwotoneHeart
                        AiTwotoneHeartFill
                        color="red"
                        size={30}
                      />
                    )}
                  </button> */}
                </div>
              </div>
            </Tilt> 
          );
        })
      )}
     
    </div>
     {allProductsFromApi?.nextPage && !loading && <div className="load-more-container ">
     <button
       className="explore-btn"
       onClick={() =>getAllProducts({limit: 9, page: allProductsFromApi.nextPage})}
     >
       See more
     </button>
   </div>}
    </div>
  );
};
