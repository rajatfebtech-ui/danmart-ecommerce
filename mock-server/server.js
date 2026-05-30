const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Seed Data ────────────────────────────────────────────────────────────────

const IMAGE_BASE = "http://localhost:3001/images";

const categories = [
  { id: 1, name: "Antiques", slug: "antiques", image: `${IMAGE_BASE}/cat1.jpg` },
  { id: 2, name: "Navigation", slug: "navigation", image: `${IMAGE_BASE}/cat2.jpg` },
  { id: 3, name: "Telescopes", slug: "telescopes", image: `${IMAGE_BASE}/cat3.jpg` },
  { id: 4, name: "Compasses", slug: "compasses", image: `${IMAGE_BASE}/cat4.jpg` },
];

const products = [
  {
    id: 1,
    name: "Antique Compass in Wooden Box",
    slug: "antique-compass-wooden-box",
    price: 89.99,
    old_price: 120.0,
    rating: 4.5,
    reviews_count: 28,
    stock: 15,
    category_id: 4,
    category: "Compasses",
    thumbnail: "antiqueCompass_woodenBox.jpg",
    images: ["antiqueCompass_woodenBox.jpg", "compass_with_leather.jpg"],
    description:
      "A beautifully crafted antique compass housed in a hand-polished wooden box. Perfect for collectors and adventure enthusiasts alike.",
    is_featured: true,
    is_new: true,
    is_top: true,
  },
  {
    id: 2,
    name: "Leather-Wrapped Compass",
    slug: "leather-wrapped-compass",
    price: 65.0,
    old_price: null,
    rating: 4.2,
    reviews_count: 14,
    stock: 8,
    category_id: 4,
    category: "Compasses",
    thumbnail: "compass_with_leather.jpg",
    images: ["compass_with_leather.jpg"],
    description:
      "A classic compass wrapped in premium leather. Durable, stylish, and ideal for outdoor navigation.",
    is_featured: false,
    is_new: true,
    is_top: false,
  },
  {
    id: 3,
    name: "Vintage Brass Telescope",
    slug: "vintage-brass-telescope",
    price: 149.99,
    old_price: 200.0,
    rating: 4.8,
    reviews_count: 42,
    stock: 5,
    category_id: 3,
    category: "Telescopes",
    thumbnail: "telescope.jpg",
    images: ["telescope.jpg"],
    description:
      "An exquisite vintage brass telescope with remarkable magnification. A must-have for astronomy lovers and collectors.",
    is_featured: true,
    is_new: false,
    is_top: true,
  },
  {
    id: 4,
    name: "Antique Navigation Set",
    slug: "antique-navigation-set",
    price: 199.99,
    old_price: 250.0,
    rating: 4.6,
    reviews_count: 19,
    stock: 3,
    category_id: 2,
    category: "Navigation",
    thumbnail: "product1.jpg",
    images: ["product1.jpg", "product2.jpg"],
    description:
      "A complete antique navigation set including compass, ruler, and charts. Perfect for maritime enthusiasts.",
    is_featured: true,
    is_new: false,
    is_top: true,
  },
  {
    id: 5,
    name: "Decorative Globe Compass",
    slug: "decorative-globe-compass",
    price: 45.0,
    old_price: null,
    rating: 4.0,
    reviews_count: 9,
    stock: 20,
    category_id: 1,
    category: "Antiques",
    thumbnail: "product3.jpg",
    images: ["product3.jpg"],
    description:
      "A stunning decorative globe compass — a wonderful display piece for home or office.",
    is_featured: false,
    is_new: true,
    is_top: false,
  },
  {
    id: 6,
    name: "Pocket Sundial Compass",
    slug: "pocket-sundial-compass",
    price: 35.99,
    old_price: 50.0,
    rating: 3.9,
    reviews_count: 7,
    stock: 12,
    category_id: 4,
    category: "Compasses",
    thumbnail: "product4.jpg",
    images: ["product4.jpg", "product5.jpg"],
    description:
      "A handy pocket-sized sundial compass. Compact, accurate, and stylish for everyday carry.",
    is_featured: false,
    is_new: false,
    is_top: true,
  },
];

// In-memory state (resets on server restart)
let cart = [];
let wishlist = [];
let orders = [];
let users = [
  { id: 1, name: "Demo User", email: "demo@danmart.com", password: "demo1234" },
];
let nextCartId = 1;
let nextOrderId = 1001;

function findProduct(id) {
  return products.find((p) => p.id === parseInt(id));
}

// ─── Helper: success/error wrappers ──────────────────────────────────────────
const ok = (res, data, message = "success") =>
  res.json({ status: "success", message, data });
const fail = (res, message, code = 400) =>
  res.status(code).json({ status: "error", message });

// ─── Auth (direct URL, no /guest or /user prefix) ────────────────────────────
app.post("/api/v1/user/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return fail(res, "Invalid email or password");
  ok(res, { token: `mock-token-${user.id}-${Date.now()}`, user: { id: user.id, name: user.name, email: user.email } });
});

// ─── Routes for both /guest and /user prefixes ───────────────────────────────
const router = express.Router();

// Register (guest only in real app, but accept on both)
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (users.find((u) => u.email === email))
    return fail(res, "Email already registered");
  const user = { id: users.length + 1, name, email, password };
  users.push(user);
  ok(res, { token: `mock-token-${user.id}-${Date.now()}`, user: { id: user.id, name: user.name, email: user.email } }, "Registered successfully");
});

// Products
router.get("/products", (req, res) => {
  ok(res, products);
});

router.get("/product/top", (req, res) => {
  ok(res, products.filter((p) => p.is_top));
});

router.get("/product/new", (req, res) => {
  ok(res, products.filter((p) => p.is_new));
});

router.get("/product/:id/:slug", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return fail(res, "Product not found", 404);
  const similar = products.filter(
    (p) => p.category_id === product.category_id && p.id !== product.id
  );
  ok(res, { product, similar_products: similar });
});

// Categories
router.get("/product-categories", (req, res) => {
  ok(res, categories);
});

router.get("/product-categories/:slug", (req, res) => {
  const cat = categories.find((c) => c.slug === req.params.slug);
  if (!cat) return fail(res, "Category not found", 404);
  const prods = products.filter((p) => p.category_id === cat.id);
  ok(res, { category: cat, products: prods });
});

// Cart
router.get("/cart", (req, res) => {
  const populated = cart.map((item) => ({
    ...item,
    product: findProduct(item.product_id),
  }));
  ok(res, { items: populated, total: cart.reduce((s, i) => s + i.quantity * findProduct(i.product_id)?.price, 0) });
});

router.post("/cart", (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const product = findProduct(product_id);
  if (!product) return fail(res, "Product not found", 404);
  const existing = cart.find((i) => i.product_id == product_id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: nextCartId++, product_id: parseInt(product_id), quantity });
  }
  ok(res, cart, "Added to cart");
});

router.put("/cart/:id", (req, res) => {
  const item = cart.find((i) => i.id === parseInt(req.params.id));
  if (!item) return fail(res, "Cart item not found", 404);
  item.quantity = req.body.quantity;
  ok(res, item, "Cart updated");
});

router.delete("/cart/:id", (req, res) => {
  const idx = cart.findIndex((i) => i.id === parseInt(req.params.id));
  if (idx === -1) return fail(res, "Cart item not found", 404);
  cart.splice(idx, 1);
  ok(res, null, "Removed from cart");
});

// Wishlist
router.get("/wishlist", (req, res) => {
  const populated = wishlist.map((w) => ({
    ...w,
    product: findProduct(w.product_id),
  }));
  ok(res, populated);
});

router.post("/wishlist", (req, res) => {
  const { product_id } = req.body;
  if (!findProduct(product_id)) return fail(res, "Product not found", 404);
  if (!wishlist.find((w) => w.product_id == product_id)) {
    wishlist.push({ id: wishlist.length + 1, product_id: parseInt(product_id) });
  }
  ok(res, wishlist, "Added to wishlist");
});

router.delete("/wishlist/:id", (req, res) => {
  const idx = wishlist.findIndex((w) => w.product_id === parseInt(req.params.id));
  if (idx === -1) return fail(res, "Not in wishlist", 404);
  wishlist.splice(idx, 1);
  ok(res, null, "Removed from wishlist");
});

// Checkout / Orders
router.get("/shipping-details", (req, res) => {
  ok(res, {
    name: "Demo User",
    email: "demo@danmart.com",
    phone: "555-0100",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    country: "US",
  });
});

router.post("/order", (req, res) => {
  const total = cart.reduce(
    (s, i) => s + i.quantity * (findProduct(i.product_id)?.price || 0),
    0
  );
  const order = {
    id: nextOrderId++,
    items: cart.map((i) => ({ ...i, product: findProduct(i.product_id) })),
    total_amount: total,
    status: "pending",
    payment_status: "unpaid",
    shipping: req.body,
    created_at: new Date().toISOString(),
  };
  orders.push(order);
  cart = []; // clear cart after order
  ok(res, { order_id: order.id, payment_url: `http://localhost:5173/payment/thanks?order_id=${order.id}&token=mock` }, "Order placed");
});

router.get("/order-history", (req, res) => {
  ok(res, orders);
});

router.post("/cancel-order/:orderId", (req, res) => {
  const order = orders.find((o) => o.id === parseInt(req.params.orderId));
  if (!order) return fail(res, "Order not found", 404);
  order.status = "cancelled";
  ok(res, order, "Order cancelled");
});

router.get("/order-track/:orderId/:token", (req, res) => {
  const order = orders.find((o) => o.id === parseInt(req.params.orderId));
  if (!order) return fail(res, "Order not found", 404);
  ok(res, {
    order_id: order.id,
    order_status: order.status,
    total_amount: order.total_amount,
    created_at: order.created_at,
    shipping_details: order.shipping || { name: "Demo", city: "Springfield", state: "IL" },
    items: order.items.map((i) => ({
      product_name: i.product?.name || "Product",
      product_thumbnail: i.product?.thumbnail || "",
      quantity: i.quantity,
      price: i.product?.price || 0,
      total: i.quantity * (i.product?.price || 0),
    })),
  });
});

// Quotations
router.post("/quotations", (req, res) => {
  ok(res, { id: Date.now() }, "Quotation request submitted");
});

// Mount router under both /user and /guest
app.use("/api/v1/user", router);
app.use("/api/v1/guest", router);

// Serve public product images from the React project's public folder
const path = require("path");
app.use("/images", express.static(path.join(__dirname, "../public")));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n  Mock API running at http://localhost:${PORT}`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /api/v1/guest/products`);
  console.log(`    GET  /api/v1/guest/product/top`);
  console.log(`    GET  /api/v1/guest/product/new`);
  console.log(`    GET  /api/v1/guest/product-categories`);
  console.log(`    GET  /api/v1/guest/cart`);
  console.log(`    POST /api/v1/guest/cart`);
  console.log(`    GET  /api/v1/guest/wishlist`);
  console.log(`    POST /api/v1/user/login`);
  console.log(`    POST /api/v1/guest/register`);
  console.log(`  Test login: demo@danmart.com / demo1234\n`);
});
