#!/usr/bin/env python3
"""DanMart Mock API Server — pure Python 3, no pip needed. Port 3001.
   All data is persisted to data.json so changes survive server restarts.
"""

import json, os, time, base64 as b64mod
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

# ─── Paths ───────────────────────────────────────────────────────────────────

BASE_DIR   = os.path.dirname(__file__)
PUBLIC_DIR = os.path.join(BASE_DIR, "..", "public")
DATA_FILE  = os.path.join(BASE_DIR, "data.json")

MIME = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png",  ".webp": "image/webp",
    ".svg": "image/svg+xml", ".gif": "image/gif",
}

ADMIN_USER = {"email": "admin@danmart.com", "password": "admin123"}

# ─── Seed data (used only when data.json does not exist) ─────────────────────

SEED = {
    "products": [
        {"id":1,"name":"Antique Compass in Wooden Box","slug":"antique-compass-wooden-box","price":89.99,"old_price":120.0,"rating":4.5,"reviews_count":28,"stock":15,"min_qty":1,"category_id":4,"category":"Compasses","thumbnail":"antiqueCompass_woodenBox.jpg","images":["antiqueCompass_woodenBox.jpg","compass_with_leather.jpg"],"description":"A beautifully crafted antique compass housed in a hand-polished wooden box.","is_active":True,"is_featured":True,"is_new":True,"is_top":True},
        {"id":2,"name":"Leather-Wrapped Compass","slug":"leather-wrapped-compass","price":65.0,"old_price":None,"rating":4.2,"reviews_count":14,"stock":8,"min_qty":1,"category_id":4,"category":"Compasses","thumbnail":"compass_with_leather.jpg","images":["compass_with_leather.jpg"],"description":"A classic compass wrapped in premium leather for outdoor navigation.","is_active":True,"is_featured":False,"is_new":True,"is_top":False},
        {"id":3,"name":"Vintage Brass Telescope","slug":"vintage-brass-telescope","price":149.99,"old_price":200.0,"rating":4.8,"reviews_count":42,"stock":5,"min_qty":1,"category_id":3,"category":"Telescopes","thumbnail":"telescope.jpg","images":["telescope.jpg"],"description":"An exquisite vintage brass telescope with remarkable magnification.","is_active":True,"is_featured":True,"is_new":False,"is_top":True},
        {"id":4,"name":"Antique Navigation Set","slug":"antique-navigation-set","price":199.99,"old_price":250.0,"rating":4.6,"reviews_count":19,"stock":3,"min_qty":1,"category_id":2,"category":"Navigation","thumbnail":"product1.jpg","images":["product1.jpg","product2.jpg"],"description":"Complete antique navigation set with compass, ruler, and charts.","is_active":True,"is_featured":True,"is_new":False,"is_top":True},
        {"id":5,"name":"Decorative Globe Compass","slug":"decorative-globe-compass","price":45.0,"old_price":None,"rating":4.0,"reviews_count":9,"stock":20,"min_qty":1,"category_id":1,"category":"Antiques","thumbnail":"product3.jpg","images":["product3.jpg"],"description":"A stunning decorative globe compass — perfect for home or office.","is_active":True,"is_featured":False,"is_new":True,"is_top":False},
        {"id":6,"name":"Pocket Sundial Compass","slug":"pocket-sundial-compass","price":35.99,"old_price":50.0,"rating":3.9,"reviews_count":7,"stock":12,"min_qty":1,"category_id":4,"category":"Compasses","thumbnail":"product4.jpg","images":["product4.jpg","product5.jpg"],"description":"Compact pocket sundial compass — stylish for everyday carry.","is_active":True,"is_featured":False,"is_new":False,"is_top":True},
    ],
    "categories": [
        {"id":1,"name":"Antiques",  "slug":"antiques",  "description":"Classic antique items"},
        {"id":2,"name":"Navigation","slug":"navigation","description":"Navigation instruments"},
        {"id":3,"name":"Telescopes","slug":"telescopes","description":"Vintage telescopes"},
        {"id":4,"name":"Compasses", "slug":"compasses", "description":"Antique compasses"},
    ],
    "banners": [
        {"id":1,"image":"slider1.jpg", "title":"Discover Rare Antiques",   "desc":"Authentic collectibles curated from around the world",      "cta":"Shop Now","href":"/category/1/antiques"},
        {"id":2,"image":"banner.jpeg", "title":"Navigation Instruments",   "desc":"Precision compasses and telescopes for the explorer in you", "cta":"Explore", "href":"/category/2/navigation"},
        {"id":3,"image":"banner2.jpg", "title":"New Arrivals Weekly",      "desc":"Be the first to own the latest additions to our collection", "cta":"View New","href":"/feature-products"},
    ],
    "users":  [{"id":1,"name":"Demo User","email":"demo@danmart.com","password":"demo1234"}],
    "orders": [],
    "next_product_id":  7,
    "next_category_id": 5,
    "next_banner_id":   4,
    "next_order_id":    1001,
}

# ─── Persistence ─────────────────────────────────────────────────────────────

def load_data():
    if os.path.isfile(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    # First run — write seed data
    save_data(SEED)
    return {k: v for k, v in SEED.items()}   # return a copy

def save_data(d):
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(d, f, indent=2)
    except Exception as e:
        print(f"  [warn] Could not save data: {e}")

# Load on startup
DB = load_data()

# Convenience references (always read from DB dict)
def products():   return DB["products"]
def categories(): return DB["categories"]
def banners():    return DB["banners"]
def users():      return DB["users"]
def orders():     return DB["orders"]

def next_id(key):
    val = DB[key]; DB[key] += 1; save_data(DB); return val

def find_product(pid):
    try: pid = int(pid)
    except: return None
    return next((p for p in products() if p["id"] == pid), None)

# ─── HTTP Handler ─────────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"  {self.command} {self.path} → {args[1]}")

    def do_OPTIONS(self):
        self.send_response(200); self._cors(); self.end_headers()

    def do_GET(self):    self._route("GET")
    def do_POST(self):   self._route("POST")
    def do_PUT(self):    self._route("PUT")
    def do_DELETE(self): self._route("DELETE")

    # ── Router ────────────────────────────────────────────────────────────────
    def _route(self, method):
        path = urlparse(self.path).path.rstrip("/")
        body = self._read_body()

        is_admin = path.startswith("/api/v1/admin")
        for prefix in ("/api/v1/user", "/api/v1/guest", "/api/v1/admin"):
            if path.startswith(prefix):
                norm = path[len(prefix):]; break
        else:
            norm = path

        if is_admin:
            self._admin(method, norm, body); return

        if norm.startswith("/images/"):
            self._serve_image(norm[8:]); return

        parts = [p for p in norm.split("/") if p]

        # Auth
        if   method == "POST" and norm == "/login":    self._login(body)
        elif method == "POST" and norm == "/register": self._register(body)

        # Products
        elif method == "GET" and norm == "/products":
            self._ok([p for p in products() if p.get("is_active", True)])
        elif method == "GET" and norm == "/product/top":
            self._ok([p for p in products() if p.get("is_top") and p.get("is_active", True)])
        elif method == "GET" and norm == "/product/new":
            self._ok([p for p in products() if p.get("is_new") and p.get("is_active", True)])
        elif method == "GET" and len(parts) == 3 and parts[0] == "product":
            prod = find_product(parts[1])
            if not prod: self._fail("Product not found", 404); return
            similar = [p for p in products() if p["category_id"] == prod["category_id"] and p["id"] != prod["id"] and p.get("is_active", True)]
            self._ok({"product": prod, "similar_products": similar})

        # Categories
        elif method == "GET" and norm == "/product-categories":
            self._ok(categories())
        elif method == "GET" and len(parts) == 2 and parts[0] == "product-categories":
            cat = next((c for c in categories() if c["slug"] == parts[1]), None)
            if not cat: self._fail("Category not found", 404); return
            prods = [p for p in products() if p["category_id"] == cat["id"] and p.get("is_active", True)]
            self._ok({"category": cat, "products": prods})

        # Cart (session-only, no persistence needed)
        elif method == "GET"  and norm == "/cart":         self._cart_get()
        elif method == "POST" and norm == "/cart":         self._cart_add(body)
        elif method == "PUT"  and len(parts)==2 and parts[0]=="cart":  self._cart_update(parts[1], body)
        elif method == "DELETE" and len(parts)==2 and parts[0]=="cart": self._cart_remove(parts[1])

        # Wishlist
        elif method == "GET"    and norm == "/wishlist":   self._ok([{**w, "product": find_product(w["product_id"])} for w in _session_wishlist])
        elif method == "POST"   and norm == "/wishlist":   self._wish_add(body)
        elif method == "DELETE" and len(parts)==2 and parts[0]=="wishlist": self._wish_remove(parts[1])

        # Orders
        elif method == "GET"  and norm == "/shipping-details":
            self._ok({"name":"Demo User","email":"demo@danmart.com","phone":"555-0100","address":"123 Main St","city":"Springfield","state":"IL","zip":"62701","country":"US"})
        elif method == "POST" and norm == "/order":        self._place_order(body)
        elif method == "GET"  and norm == "/order-history": self._ok(orders())
        elif method == "POST" and len(parts)==2 and parts[0]=="cancel-order": self._cancel_order(parts[1])
        elif method == "GET"  and len(parts)==3 and parts[0]=="order-track":  self._track_order(parts[1], parts[2])

        # Banners
        elif method == "GET" and norm == "/banners":       self._ok(banners())

        # Quotations
        elif method == "POST" and norm == "/quotations":   self._ok({"id": int(time.time())}, "Submitted")

        else: self._fail(f"No route for {method} {norm}", 404)

    # ── Admin ─────────────────────────────────────────────────────────────────
    def _admin(self, method, norm, body):
        norm = norm or "/"
        parts = [p for p in norm.split("/") if p]

        # Login
        if method == "POST" and norm == "/login":
            if body.get("email") == ADMIN_USER["email"] and body.get("password") == ADMIN_USER["password"]:
                self._ok({"token": f"admin-token-{int(time.time())}"})
            else:
                self._fail("Invalid admin credentials")
            return

        # Dashboard
        if method == "GET" and norm in ("", "/", "/dashboard"):
            self._ok({"total_orders": len(orders()), "total_revenue": round(sum(o.get("total_amount",0) for o in orders()),2), "total_products": len(products()), "total_users": len(users())}); return

        # Products CRUD
        if norm == "/products":
            if method == "GET":
                self._ok([{**p, "category_name": p.get("category","")} for p in products()]); return
            if method == "POST":
                pid = next_id("next_product_id")
                p = {"id": pid, "is_active": True, "is_top": False, "is_new": True, "rating": 0, "reviews_count": 0, "min_qty": 1, **body}
                products().append(p); save_data(DB)
                self._ok(p, "Product created"); return

        if len(parts) == 2 and parts[0] == "products":
            pid = parts[1]
            if method == "GET":
                p = find_product(pid)
                if not p: self._fail("Not found", 404); return
                self._ok(p); return
            if method == "PUT":
                p = find_product(pid)
                if not p: self._fail("Not found", 404); return
                p.update(body); save_data(DB); self._ok(p, "Updated"); return
            if method == "DELETE":
                idx = next((i for i,x in enumerate(products()) if x["id"]==int(pid)), None)
                if idx is None: self._fail("Not found", 404); return
                products().pop(idx); save_data(DB); self._ok(None, "Deleted"); return

        # Categories CRUD
        if norm == "/categories":
            if method == "GET":   self._ok(categories()); return
            if method == "POST":
                cid = next_id("next_category_id")
                cat = {"id": cid, **body}
                categories().append(cat); save_data(DB)
                self._ok(cat, "Category created"); return

        if len(parts) == 2 and parts[0] == "categories":
            cid = int(parts[1])
            cat = next((c for c in categories() if c["id"]==cid), None)
            if method == "GET":
                if not cat: self._fail("Not found",404); return
                self._ok(cat); return
            if method == "PUT":
                if not cat: self._fail("Not found",404); return
                cat.update(body); save_data(DB); self._ok(cat,"Updated"); return
            if method == "DELETE":
                idx = next((i for i,c in enumerate(categories()) if c["id"]==cid), None)
                if idx is None: self._fail("Not found",404); return
                categories().pop(idx); save_data(DB); self._ok(None,"Deleted"); return

        # Banners CRUD
        if norm == "/banners":
            if method == "GET":  self._ok(banners()); return
            if method == "POST":
                bid = next_id("next_banner_id")
                b = {"id": bid, **body}
                banners().append(b); save_data(DB)
                self._ok(b, "Banner created"); return

        if len(parts) == 2 and parts[0] == "banners":
            bid = int(parts[1])
            banner = next((b for b in banners() if b["id"]==bid), None)
            if method == "PUT":
                if not banner: self._fail("Not found",404); return
                banner.update(body); save_data(DB); self._ok(banner,"Updated"); return
            if method == "DELETE":
                idx = next((i for i,b in enumerate(banners()) if b["id"]==bid), None)
                if idx is None: self._fail("Not found",404); return
                banners().pop(idx); save_data(DB); self._ok(None,"Deleted"); return

        # Orders
        if norm == "/orders" and method == "GET":
            result = [{**o, "order_status": o.get("status","pending"),
                       "customer_name": next((u["name"] for u in users() if u["id"]==o.get("user_id")), "Guest"),
                       "customer_email": next((u["email"] for u in users() if u["id"]==o.get("user_id")), "")} for o in orders()]
            self._ok(result); return

        if len(parts)==2 and parts[0]=="orders":
            oid = int(parts[1])
            order = next((o for o in orders() if o["id"]==oid), None)
            if method == "GET":
                if not order: self._fail("Not found",404); return
                u = next((u for u in users() if u["id"]==order.get("user_id")), None)
                self._ok({**order,"order_status":order.get("status","pending"),
                          "customer_name":u["name"] if u else "Guest",
                          "customer_email":u["email"] if u else "",
                          "shipping_details":order.get("shipping",{})}); return

        if len(parts)==3 and parts[0]=="orders" and parts[2]=="status":
            oid = int(parts[1])
            order = next((o for o in orders() if o["id"]==oid), None)
            if method == "PUT":
                if not order: self._fail("Not found",404); return
                order["status"] = body.get("status", order.get("status"))
                save_data(DB); self._ok(order,"Status updated"); return

        # Image upload
        if norm == "/upload-image" and method == "POST":
            filename = body.get("filename", f"upload_{int(time.time())}.jpg")
            data = body.get("data", "")
            if "," in data: data = data.split(",",1)[1]
            try:
                with open(os.path.join(PUBLIC_DIR, filename), "wb") as f:
                    f.write(b64mod.b64decode(data))
                self._ok({"filename": filename}, "Uploaded"); return
            except Exception as e:
                self._fail(f"Upload failed: {e}"); return

        # Users
        if norm == "/users" and method == "GET":
            self._ok([{"id":u["id"],"name":u["name"],"email":u["email"],
                       "created_at":time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                       "orders_count":sum(1 for o in orders() if o.get("user_id")==u["id"])} for u in users()]); return

        self._fail(f"No admin route for {method} {norm}", 404)

    # ── Cart (session, in-memory) ─────────────────────────────────────────────
    def _cart_get(self):
        populated, total = [], 0.0
        for item in _session_cart:
            prod = find_product(item["product_id"])
            if prod:
                populated.append({**item, "product": prod})
                total += item["quantity"] * prod["price"]
        self._ok({"items": populated, "total": round(total,2)})

    def _cart_add(self, body):
        pid = body.get("product_id"); qty = int(body.get("quantity",1))
        prod = find_product(pid)
        if not prod: self._fail("Product not found",404); return
        existing = next((i for i in _session_cart if i["product_id"]==int(pid)), None)
        if existing: existing["quantity"] += qty
        else: _session_cart.append({"id": _next_cart_id[0], "product_id": int(pid), "quantity": qty}); _next_cart_id[0] += 1
        self._ok(_session_cart, "Added to cart")

    def _cart_update(self, cid, body):
        item = next((i for i in _session_cart if i["id"]==int(cid)), None)
        if not item: self._fail("Not found",404); return
        item["quantity"] = body.get("quantity", item["quantity"]); self._ok(item,"Updated")

    def _cart_remove(self, cid):
        idx = next((i for i,x in enumerate(_session_cart) if x["id"]==int(cid)), None)
        if idx is None: self._fail("Not found",404); return
        _session_cart.pop(idx); self._ok(None,"Removed")

    # ── Wishlist (session) ────────────────────────────────────────────────────
    def _wish_add(self, body):
        pid = body.get("product_id")
        if not find_product(pid): self._fail("Not found",404); return
        if not any(w["product_id"]==int(pid) for w in _session_wishlist):
            _session_wishlist.append({"id":len(_session_wishlist)+1,"product_id":int(pid)})
        self._ok(_session_wishlist,"Added")

    def _wish_remove(self, pid):
        idx = next((i for i,w in enumerate(_session_wishlist) if w["product_id"]==int(pid)), None)
        if idx is None: self._fail("Not found",404); return
        _session_wishlist.pop(idx); self._ok(None,"Removed")

    # ── Orders ────────────────────────────────────────────────────────────────
    def _place_order(self, body):
        total = sum(i["quantity"]*(find_product(i["product_id"]) or {}).get("price",0) for i in _session_cart)
        oid = next_id("next_order_id")
        order = {"id":oid,"items":[{**i,"product":find_product(i["product_id"])} for i in _session_cart],
                 "total_amount":round(total,2),"status":"pending","payment_status":"unpaid",
                 "shipping":body,"created_at":time.strftime("%Y-%m-%dT%H:%M:%SZ")}
        orders().append(order); save_data(DB); _session_cart.clear()
        self._ok({"order_id":oid},"Order placed")

    def _cancel_order(self, oid):
        order = next((o for o in orders() if o["id"]==int(oid)), None)
        if not order: self._fail("Not found",404); return
        order["status"] = "cancelled"; save_data(DB); self._ok(order,"Cancelled")

    def _track_order(self, oid, token):
        order = next((o for o in orders() if o["id"]==int(oid)), None)
        if not order: self._fail("Order not found",404); return
        self._ok({"order_id":order["id"],"order_status":order["status"],
                  "total_amount":order["total_amount"],"created_at":order["created_at"],
                  "shipping_details":order.get("shipping",{}),
                  "items":[{"product_name":i["product"]["name"],"product_thumbnail":i["product"]["thumbnail"],
                             "quantity":i["quantity"],"price":i["product"]["price"],
                             "total":i["quantity"]*i["product"]["price"]} for i in order["items"] if i.get("product")]})

    # ── Auth ──────────────────────────────────────────────────────────────────
    def _login(self, body):
        user = next((u for u in users() if u["email"]==body.get("email") and u["password"]==body.get("password")), None)
        if not user: self._fail("Invalid email or password"); return
        self._ok({"token":f"mock-token-{user['id']}-{int(time.time())}","user":{"id":user["id"],"name":user["name"],"email":user["email"]}})

    def _register(self, body):
        email = body.get("email")
        if any(u["email"]==email for u in users()): self._fail("Email already registered"); return
        user = {"id":len(users())+1,"name":body.get("name",""),"email":email,"password":body.get("password","")}
        users().append(user); save_data(DB)
        self._ok({"token":f"mock-token-{user['id']}-{int(time.time())}","user":{"id":user["id"],"name":user["name"],"email":user["email"]}},"Registered")

    # ── Image serving ─────────────────────────────────────────────────────────
    def _serve_image(self, filename):
        filepath = os.path.join(PUBLIC_DIR, filename)
        if not os.path.isfile(filepath):
            self.send_response(404); self._cors(); self.end_headers(); return
        ext  = os.path.splitext(filename)[1].lower()
        mime = MIME.get(ext, "application/octet-stream")
        with open(filepath, "rb") as f: data = f.read()
        self.send_response(200); self._cors()
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers(); self.wfile.write(data)

    # ── Helpers ───────────────────────────────────────────────────────────────
    def _ok(self, data, message="success"):
        self._json({"status":"success","message":message,"data":data})

    def _fail(self, message, code=400):
        self._json({"status":"error","message":message}, code)

    def _json(self, payload, code=200):
        body = json.dumps(payload).encode()
        self.send_response(code); self._cors()
        self.send_header("Content-Type","application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers(); self.wfile.write(body)

    def _cors(self):
        origin = self.headers.get("Origin","*")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers","Content-Type, Authorization, guest-uuid, Accept")
        self.send_header("Access-Control-Allow-Credentials","true")
        self.send_header("Vary","Origin")

    def _read_body(self):
        length = int(self.headers.get("Content-Length",0))
        if length == 0: return {}
        try: return json.loads(self.rfile.read(length))
        except: return {}

# ─── Session state (per-process, not persisted) ───────────────────────────────
_session_cart     = []
_session_wishlist = []
_next_cart_id     = [1]

# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"\n  DanMart API  →  http://0.0.0.0:{port}")
    print(f"  Data file    →  {DATA_FILE}")
    print("  User login   →  demo@danmart.com / demo1234")
    print("  Admin login  →  admin@danmart.com / admin123\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped.")
