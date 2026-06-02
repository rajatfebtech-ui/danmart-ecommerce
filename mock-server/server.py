#!/usr/bin/env python3
"""DanMart Mock API Server — pure Python 3, no pip needed. Port 3001."""

import json
import os
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

# ─── Seed data ────────────────────────────────────────────────────────────────

IMAGE_BASE = "http://localhost:3001/images"

CATEGORIES = [
    {"id": 1, "name": "Antiques",   "slug": "antiques",   "image": f"{IMAGE_BASE}/about.webp"},
    {"id": 2, "name": "Navigation", "slug": "navigation", "image": f"{IMAGE_BASE}/banner.jpeg"},
    {"id": 3, "name": "Telescopes", "slug": "telescopes", "image": f"{IMAGE_BASE}/telescope.jpg"},
    {"id": 4, "name": "Compasses",  "slug": "compasses",  "image": f"{IMAGE_BASE}/compass_with_leather.jpg"},
]

PRODUCTS = [
    {
        "id": 1, "name": "Antique Compass in Wooden Box",
        "slug": "antique-compass-wooden-box",
        "price": 89.99, "old_price": 120.0, "rating": 4.5, "reviews_count": 28,
        "stock": 15, "category_id": 4, "category": "Compasses",
        "thumbnail": "antiqueCompass_woodenBox.jpg",
        "images": ["antiqueCompass_woodenBox.jpg", "compass_with_leather.jpg"],
        "description": "A beautifully crafted antique compass housed in a hand-polished wooden box.",
        "is_featured": True, "is_new": True, "is_top": True,
    },
    {
        "id": 2, "name": "Leather-Wrapped Compass",
        "slug": "leather-wrapped-compass",
        "price": 65.0, "old_price": None, "rating": 4.2, "reviews_count": 14,
        "stock": 8, "category_id": 4, "category": "Compasses",
        "thumbnail": "compass_with_leather.jpg",
        "images": ["compass_with_leather.jpg"],
        "description": "A classic compass wrapped in premium leather for outdoor navigation.",
        "is_featured": False, "is_new": True, "is_top": False,
    },
    {
        "id": 3, "name": "Vintage Brass Telescope",
        "slug": "vintage-brass-telescope",
        "price": 149.99, "old_price": 200.0, "rating": 4.8, "reviews_count": 42,
        "stock": 5, "category_id": 3, "category": "Telescopes",
        "thumbnail": "telescope.jpg",
        "images": ["telescope.jpg"],
        "description": "An exquisite vintage brass telescope with remarkable magnification.",
        "is_featured": True, "is_new": False, "is_top": True,
    },
    {
        "id": 4, "name": "Antique Navigation Set",
        "slug": "antique-navigation-set",
        "price": 199.99, "old_price": 250.0, "rating": 4.6, "reviews_count": 19,
        "stock": 3, "category_id": 2, "category": "Navigation",
        "thumbnail": "product1.jpg",
        "images": ["product1.jpg", "product2.jpg"],
        "description": "Complete antique navigation set with compass, ruler, and charts.",
        "is_featured": True, "is_new": False, "is_top": True,
    },
    {
        "id": 5, "name": "Decorative Globe Compass",
        "slug": "decorative-globe-compass",
        "price": 45.0, "old_price": None, "rating": 4.0, "reviews_count": 9,
        "stock": 20, "category_id": 1, "category": "Antiques",
        "thumbnail": "product3.jpg",
        "images": ["product3.jpg"],
        "description": "A stunning decorative globe compass — perfect for home or office.",
        "is_featured": False, "is_new": True, "is_top": False,
    },
    {
        "id": 6, "name": "Pocket Sundial Compass",
        "slug": "pocket-sundial-compass",
        "price": 35.99, "old_price": 50.0, "rating": 3.9, "reviews_count": 7,
        "stock": 12, "category_id": 4, "category": "Compasses",
        "thumbnail": "product4.jpg",
        "images": ["product4.jpg", "product5.jpg"],
        "description": "Compact pocket sundial compass — stylish for everyday carry.",
        "is_featured": False, "is_new": False, "is_top": True,
    },
]

# In-memory state
cart = []       # {id, product_id, quantity}
wishlist = []   # {id, product_id}
orders = []     # order objects
users = [{"id": 1, "name": "Demo User", "email": "demo@danmart.com", "password": "demo1234"}]
next_cart_id = [1]
next_order_id = [1001]
next_product_id = [7]
next_category_id = [5]
next_banner_id = [4]

BANNERS = [
    {"id": 1, "image": "slider1.jpg",  "title": "Discover Rare Antiques",    "desc": "Authentic collectibles curated from around the world",      "cta": "Shop Now", "href": "/category/1/antiques"},
    {"id": 2, "image": "banner.jpeg",  "title": "Navigation Instruments",    "desc": "Precision compasses and telescopes for the explorer in you", "cta": "Explore",  "href": "/category/2/navigation"},
    {"id": 3, "image": "banner2.jpg",  "title": "New Arrivals Weekly",       "desc": "Be the first to own the latest additions to our collection", "cta": "View New", "href": "/feature-products"},
]

ADMIN_USER = {"email": "admin@danmart.com", "password": "admin123"}

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "public")

MIME = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png",  ".webp": "image/webp",
    ".svg": "image/svg+xml", ".gif": "image/gif",
}


def find_product(pid):
    try:
        pid = int(pid)
    except (ValueError, TypeError):
        return None
    return next((p for p in PRODUCTS if p["id"] == pid), None)


class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"  {self.command} {self.path} → {args[1]}")

    # ── CORS pre-flight ───────────────────────────────────────────────────────
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        self._route("GET")

    def do_POST(self):
        self._route("POST")

    def do_PUT(self):
        self._route("PUT")

    def do_DELETE(self):
        self._route("DELETE")

    # ── Routing ───────────────────────────────────────────────────────────────
    def _route(self, method):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = self._read_body()

        # Strip prefix → normalised path
        is_admin = path.startswith("/api/v1/admin")
        for prefix in ("/api/v1/user", "/api/v1/guest", "/api/v1/admin"):
            if path.startswith(prefix):
                norm = path[len(prefix):]
                break
        else:
            norm = path  # e.g. /images/...

        if is_admin:
            self._route_admin(method, norm, body)
            return

        # Serve static images
        if norm.startswith("/images/"):
            self._serve_image(norm[8:])
            return

        parts = [p for p in norm.split("/") if p]

        # ── Auth ──────────────────────────────────────────────────────────────
        if method == "POST" and norm == "/login":
            self._login(body)
        elif method == "POST" and norm == "/register":
            self._register(body)

        # ── Products ──────────────────────────────────────────────────────────
        elif method == "GET" and norm == "/products":
            self._ok(PRODUCTS)
        elif method == "GET" and norm == "/product/top":
            self._ok([p for p in PRODUCTS if p["is_top"]])
        elif method == "GET" and norm == "/product/new":
            self._ok([p for p in PRODUCTS if p["is_new"]])
        elif method == "GET" and len(parts) == 3 and parts[0] == "product":
            prod = find_product(parts[1])
            if not prod:
                self._fail("Product not found", 404); return
            similar = [p for p in PRODUCTS if p["category_id"] == prod["category_id"] and p["id"] != prod["id"]]
            self._ok({"product": prod, "similar_products": similar})

        # ── Categories ────────────────────────────────────────────────────────
        elif method == "GET" and norm == "/product-categories":
            self._ok(CATEGORIES)
        elif method == "GET" and len(parts) == 2 and parts[0] == "product-categories":
            cat = next((c for c in CATEGORIES if c["slug"] == parts[1]), None)
            if not cat:
                self._fail("Category not found", 404); return
            prods = [p for p in PRODUCTS if p["category_id"] == cat["id"]]
            self._ok({"category": cat, "products": prods})

        # ── Cart ──────────────────────────────────────────────────────────────
        elif method == "GET" and norm == "/cart":
            populated = []
            total = 0.0
            for item in cart:
                prod = find_product(item["product_id"])
                if prod:
                    populated.append({**item, "product": prod})
                    total += item["quantity"] * prod["price"]
            self._ok({"items": populated, "total": round(total, 2)})
        elif method == "POST" and norm == "/cart":
            product_id = body.get("product_id")
            qty = int(body.get("quantity", 1))
            prod = find_product(product_id)
            if not prod:
                self._fail("Product not found", 404); return
            existing = next((i for i in cart if i["product_id"] == int(product_id)), None)
            if existing:
                existing["quantity"] += qty
            else:
                cart.append({"id": next_cart_id[0], "product_id": int(product_id), "quantity": qty})
                next_cart_id[0] += 1
            self._ok(cart, "Added to cart")
        elif method == "PUT" and len(parts) == 2 and parts[0] == "cart":
            item = next((i for i in cart if i["id"] == int(parts[1])), None)
            if not item:
                self._fail("Cart item not found", 404); return
            item["quantity"] = body.get("quantity", item["quantity"])
            self._ok(item, "Cart updated")
        elif method == "DELETE" and len(parts) == 2 and parts[0] == "cart":
            idx = next((i for i, x in enumerate(cart) if x["id"] == int(parts[1])), None)
            if idx is None:
                self._fail("Cart item not found", 404); return
            cart.pop(idx)
            self._ok(None, "Removed from cart")

        # ── Wishlist ──────────────────────────────────────────────────────────
        elif method == "GET" and norm == "/wishlist":
            self._ok([{**w, "product": find_product(w["product_id"])} for w in wishlist])
        elif method == "POST" and norm == "/wishlist":
            pid = body.get("product_id")
            if not find_product(pid):
                self._fail("Product not found", 404); return
            if not any(w["product_id"] == int(pid) for w in wishlist):
                wishlist.append({"id": len(wishlist) + 1, "product_id": int(pid)})
            self._ok(wishlist, "Added to wishlist")
        elif method == "DELETE" and len(parts) == 2 and parts[0] == "wishlist":
            idx = next((i for i, w in enumerate(wishlist) if w["product_id"] == int(parts[1])), None)
            if idx is None:
                self._fail("Not in wishlist", 404); return
            wishlist.pop(idx)
            self._ok(None, "Removed from wishlist")

        # ── Checkout / Orders ─────────────────────────────────────────────────
        elif method == "GET" and norm == "/shipping-details":
            self._ok({"name": "Demo User", "email": "demo@danmart.com", "phone": "555-0100",
                      "address": "123 Main St", "city": "Springfield", "state": "IL",
                      "zip": "62701", "country": "US"})
        elif method == "POST" and norm == "/order":
            total = sum(i["quantity"] * (find_product(i["product_id"]) or {}).get("price", 0) for i in cart)
            oid = next_order_id[0]; next_order_id[0] += 1
            order = {
                "id": oid,
                "items": [{**i, "product": find_product(i["product_id"])} for i in cart],
                "total_amount": round(total, 2),
                "status": "pending", "payment_status": "unpaid",
                "shipping": body,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
            orders.append(order)
            cart.clear()
            self._ok({"order_id": oid, "payment_url": f"http://localhost:5173/payment/thanks?order_id={oid}&token=mock"}, "Order placed")
        elif method == "GET" and norm == "/order-history":
            self._ok(orders)
        elif method == "POST" and len(parts) == 2 and parts[0] == "cancel-order":
            order = next((o for o in orders if o["id"] == int(parts[1])), None)
            if not order:
                self._fail("Order not found", 404); return
            order["status"] = "cancelled"
            self._ok(order, "Order cancelled")
        elif method == "GET" and len(parts) == 3 and parts[0] == "order-track":
            order = next((o for o in orders if o["id"] == int(parts[1])), None)
            if not order:
                self._fail("Order not found", 404); return
            self._ok({
                "order_id": order["id"], "order_status": order["status"],
                "total_amount": order["total_amount"], "created_at": order["created_at"],
                "shipping_details": order.get("shipping") or {"name": "Demo", "city": "Springfield", "state": "IL"},
                "items": [{"product_name": i["product"]["name"], "product_thumbnail": i["product"]["thumbnail"],
                           "quantity": i["quantity"], "price": i["product"]["price"],
                           "total": i["quantity"] * i["product"]["price"]} for i in order["items"] if i.get("product")],
            })

        # ── Banners (public) ──────────────────────────────────────────────────
        elif method == "GET" and norm == "/banners":
            self._ok(BANNERS)

        # ── Quotations ────────────────────────────────────────────────────────
        elif method == "POST" and norm == "/quotations":
            self._ok({"id": int(time.time())}, "Quotation submitted")

        else:
            self._fail(f"No mock for {method} {norm}", 404)

    # ── Admin routing ─────────────────────────────────────────────────────────
    def _route_admin(self, method, norm, body):
        norm = norm or "/"
        parts = [p for p in norm.split("/") if p]

        # Admin login (no auth required)
        if method == "POST" and norm == "/login":
            if body.get("email") == ADMIN_USER["email"] and body.get("password") == ADMIN_USER["password"]:
                self._ok({"token": f"admin-token-{int(time.time())}"})
            else:
                self._fail("Invalid admin credentials")
            return

        # Dashboard stats
        if method == "GET" and (norm == "" or norm == "/"):
            self._ok({
                "total_orders": len(orders),
                "total_revenue": round(sum(o.get("total_amount", 0) for o in orders), 2),
                "total_products": len(PRODUCTS),
                "total_users": len(users),
            })
            return
        if method == "GET" and norm == "/dashboard":
            self._ok({
                "total_orders": len(orders),
                "total_revenue": round(sum(o.get("total_amount", 0) for o in orders), 2),
                "total_products": len(PRODUCTS),
                "total_users": len(users),
            })
            return

        # Admin products CRUD
        if norm == "/products":
            if method == "GET":
                data = [{**p, "category_name": p.get("category", "")} for p in PRODUCTS]
                self._ok(data); return
            if method == "POST":
                pid = next_product_id[0]; next_product_id[0] += 1
                p = {"id": pid, "is_active": True, "is_top": False, "is_new": True, "rating": 0, "reviews_count": 0, **body}
                PRODUCTS.append(p)
                self._ok(p, "Product created"); return

        if len(parts) == 2 and parts[0] == "products":
            pid_str = parts[1]
            if method == "GET":
                p = find_product(pid_str)
                if not p: self._fail("Not found", 404); return
                self._ok(p); return
            if method == "PUT":
                p = find_product(pid_str)
                if not p: self._fail("Not found", 404); return
                p.update(body)
                self._ok(p, "Updated"); return
            if method == "DELETE":
                idx = next((i for i, x in enumerate(PRODUCTS) if x["id"] == int(pid_str)), None)
                if idx is None: self._fail("Not found", 404); return
                PRODUCTS.pop(idx)
                self._ok(None, "Deleted"); return

        # Admin categories CRUD
        if norm == "/categories":
            if method == "GET":
                self._ok(CATEGORIES); return
            if method == "POST":
                cid = next_category_id[0]; next_category_id[0] += 1
                cat = {"id": cid, **body}
                CATEGORIES.append(cat)
                self._ok(cat, "Category created"); return

        if len(parts) == 2 and parts[0] == "categories":
            cid = int(parts[1])
            cat = next((c for c in CATEGORIES if c["id"] == cid), None)
            if method == "GET":
                if not cat: self._fail("Not found", 404); return
                self._ok(cat); return
            if method == "PUT":
                if not cat: self._fail("Not found", 404); return
                cat.update(body); self._ok(cat, "Updated"); return
            if method == "DELETE":
                idx = next((i for i, c in enumerate(CATEGORIES) if c["id"] == cid), None)
                if idx is None: self._fail("Not found", 404); return
                CATEGORIES.pop(idx); self._ok(None, "Deleted"); return

        # Admin orders
        if norm == "/orders":
            if method == "GET":
                result = []
                for o in orders:
                    u = next((u for u in users if u["id"] == o.get("user_id")), None)
                    result.append({
                        **o,
                        "order_status": o.get("status", "pending"),
                        "customer_name": (u["name"] if u else "Guest"),
                        "customer_email": (u["email"] if u else ""),
                    })
                self._ok(result); return

        if len(parts) == 2 and parts[0] == "orders":
            oid = int(parts[1])
            order = next((o for o in orders if o["id"] == oid), None)
            if method == "GET":
                if not order: self._fail("Not found", 404); return
                u = next((u for u in users if u["id"] == order.get("user_id")), None)
                self._ok({**order, "order_status": order.get("status", "pending"),
                          "customer_name": u["name"] if u else "Guest",
                          "customer_email": u["email"] if u else "",
                          "shipping_details": order.get("shipping", {})}); return

        if len(parts) == 3 and parts[0] == "orders" and parts[2] == "status":
            oid = int(parts[1])
            order = next((o for o in orders if o["id"] == oid), None)
            if method == "PUT":
                if not order: self._fail("Not found", 404); return
                order["status"] = body.get("status", order.get("status"))
                self._ok(order, "Status updated"); return

        # Admin banners CRUD
        if norm == "/banners":
            if method == "GET":
                self._ok(BANNERS); return
            if method == "POST":
                bid = next_banner_id[0]; next_banner_id[0] += 1
                b = {"id": bid, **body}
                BANNERS.append(b)
                self._ok(b, "Banner created"); return

        if len(parts) == 2 and parts[0] == "banners":
            bid = int(parts[1])
            banner = next((b for b in BANNERS if b["id"] == bid), None)
            if method == "PUT":
                if not banner: self._fail("Not found", 404); return
                banner.update(body); self._ok(banner, "Updated"); return
            if method == "DELETE":
                idx = next((i for i, b in enumerate(BANNERS) if b["id"] == bid), None)
                if idx is None: self._fail("Not found", 404); return
                BANNERS.pop(idx); self._ok(None, "Deleted"); return

        # Image upload — save base64 to public dir
        if norm == "/upload-image" and method == "POST":
            import base64 as b64mod
            filename = body.get("filename", f"upload_{int(time.time())}.jpg")
            data = body.get("data", "")
            # Strip data URL prefix if present
            if "," in data:
                data = data.split(",", 1)[1]
            try:
                filepath = os.path.join(PUBLIC_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(b64mod.b64decode(data))
                self._ok({"filename": filename}, "Image uploaded"); return
            except Exception as e:
                self._fail(f"Upload failed: {e}"); return

        # Admin users
        if norm == "/users" and method == "GET":
            self._ok([{"id": u["id"], "name": u["name"], "email": u["email"],
                       "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                       "orders_count": sum(1 for o in orders if o.get("user_id") == u["id"])} for u in users])
            return

        self._fail(f"No admin mock for {method} {norm}", 404)

    # ── Auth helpers ──────────────────────────────────────────────────────────
    def _login(self, body):
        user = next((u for u in users if u["email"] == body.get("email") and u["password"] == body.get("password")), None)
        if not user:
            self._fail("Invalid email or password"); return
        self._ok({"token": f"mock-token-{user['id']}-{int(time.time())}", "user": {"id": user["id"], "name": user["name"], "email": user["email"]}})

    def _register(self, body):
        email = body.get("email")
        if any(u["email"] == email for u in users):
            self._fail("Email already registered"); return
        user = {"id": len(users) + 1, "name": body.get("name", ""), "email": email, "password": body.get("password", "")}
        users.append(user)
        self._ok({"token": f"mock-token-{user['id']}-{int(time.time())}", "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}, "Registered successfully")

    # ── Image serving ─────────────────────────────────────────────────────────
    def _serve_image(self, filename):
        filepath = os.path.join(PUBLIC_DIR, filename)
        ext = os.path.splitext(filename)[1].lower()
        mime = MIME.get(ext, "application/octet-stream")
        if not os.path.isfile(filepath):
            self.send_response(404); self._cors(); self.end_headers(); return
        with open(filepath, "rb") as f:
            data = f.read()
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    # ── Response helpers ──────────────────────────────────────────────────────
    def _ok(self, data, message="success"):
        self._json({"status": "success", "message": message, "data": data})

    def _fail(self, message, code=400):
        self._json({"status": "error", "message": message}, code)

    def _json(self, payload, code=200):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _cors(self):
        origin = self.headers.get("Origin", "*")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, guest-uuid, Accept")
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Vary", "Origin")

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        try:
            return json.loads(self.rfile.read(length))
        except Exception:
            return {}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"\n  DanMart Mock API running at http://0.0.0.0:{port}")
    print("  User login: demo@danmart.com / demo1234")
    print("  Admin login: admin@danmart.com / admin123\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Mock API stopped.")
