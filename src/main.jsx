import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Provider } from "react-redux";
import store from "./USER/store/store.jsx";

// User pages
import Main from "./USER/pages/Main.jsx";
import ShoppingCart from "./USER/pages/Orders/ShoppingCart.jsx";
import CheckOut from "./USER/pages/Orders/CheckOut.jsx";
import AboutUs from "./USER/pages/AboutUs.jsx";
import ContactUs from "./USER/pages/ContactUs.jsx";
import Login from "./USER/pages/Authentication/Login.jsx";
import Register from "./USER/pages/Authentication/Register.jsx";
import ProductView from "./USER/pages/Products/ProductView.jsx";
import WishList from "./USER/pages/WishList.jsx";
import CategoriesPage from "./USER/pages/Categories/CategoriesPage.jsx";
import Thanks from "./USER/pages/Payment/Thanks.jsx";
import TopProducts from "./USER/pages/Products/TopProducts.jsx";
import FeatureProducts from "./USER/pages/Products/FeatureProducts.jsx";
import OrderHistory from "./USER/pages/Orders/OrderHistory.jsx";
import PaymentCancel from "./USER/pages/Payment/PaymentCancel.jsx";
import PaymentFailed from "./USER/pages/Payment/PaymentFailed.jsx";
import TrackOrder from "./USER/pages/Orders/TrackOrder.jsx";

// Admin pages
import AdminLayout from "./ADMIN/AdminLayout.jsx";
import AdminLogin from "./ADMIN/pages/AdminLogin.jsx";
import Dashboard from "./ADMIN/pages/Dashboard.jsx";
import ProductsList from "./ADMIN/pages/products/ProductsList.jsx";
import ProductForm from "./ADMIN/pages/products/ProductForm.jsx";
import CategoriesList from "./ADMIN/pages/categories/CategoriesList.jsx";
import OrdersList from "./ADMIN/pages/orders/OrdersList.jsx";
import OrderDetail from "./ADMIN/pages/orders/OrderDetail.jsx";
import UsersList from "./ADMIN/pages/users/UsersList.jsx";
import AdminProtectedRoute from "./ADMIN/routes/AdminProtectedRoute.jsx";

const router = createBrowserRouter([
  // User routes
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Main /> },
      { path: "/cart", element: <ShoppingCart /> },
      { path: "/checkout", element: <CheckOut /> },
      { path: "/wishlist", element: <WishList /> },
      { path: "/about", element: <AboutUs /> },
      { path: "/contact", element: <ContactUs /> },
      { path: "/products/:id/:slug", element: <ProductView /> },
      { path: "/category/:id/:slug", element: <CategoriesPage /> },
      { path: "/top-products", element: <TopProducts /> },
      { path: "/feature-products", element: <FeatureProducts /> },
      { path: "/orders", element: <OrderHistory /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Register /> },
  { path: "/thanks", element: <Thanks /> },
  { path: "/cancel", element: <PaymentCancel /> },
  { path: "/failed", element: <PaymentFailed /> },
  { path: "/track", element: <TrackOrder /> },

  // Admin routes
  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin",
    element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products", element: <ProductsList /> },
      { path: "products/new", element: <ProductForm /> },
      { path: "products/edit/:id", element: <ProductForm /> },
      { path: "categories", element: <CategoriesList /> },
      { path: "orders", element: <OrdersList /> },
      { path: "orders/:id", element: <OrderDetail /> },
      { path: "users", element: <UsersList /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb", currency: "USD" }}>
          <RouterProvider router={router} />
        </PayPalScriptProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
