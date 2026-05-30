import React, { useEffect } from 'react'
import Banner from '../components/Banner';
import ImageWrapper from '../components/ImageWrapper';
import Home from '../components/Home';
import Banner2 from '../components/Banner2';
import TopProducts from '../components/Products/TopProducts';
import NewArrival from '../components/Products/NewArrival';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Main = () => {
  useEffect(() => {
    document.title = "DanMart"
  }, [])
  return (
    <>
     <Banner />
     {/* <ImageWrapper /> */}
      <Home />
      <Banner2 src="banner.jpeg" title="New To The Product World" />
      <TopProducts />
      <Banner2 src="banner2.jpg" title="New Arrival Product" />
      <NewArrival />
      {/* <ProductView /> */}
      <ToastContainer position="bottom-right"
      />
    </>
  )
}

export default Main