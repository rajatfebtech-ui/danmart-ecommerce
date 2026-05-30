import React from "react";
import Categories from "./Categories";
import Products from "./Products/Products";

const Home = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <Categories />
      </aside>
      <div className="flex-1 min-w-0">
        <Products />
      </div>
    </div>
  </div>
);

export default Home;
