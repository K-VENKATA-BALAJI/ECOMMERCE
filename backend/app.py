import tornado.web
import tornado.ioloop
import tornado.escape
import pymysql
import json
import hashlib
import os

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class CORSMixin:
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "http://localhost:3000")
        self.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.set_header("Access-Control-Allow-Credentials", "true")

    def options(self, *args, **kwargs):
        self.set_status(204)
        self.finish()

class BaseHandler(CORSMixin, tornado.web.RequestHandler):
    def get_db(self):
        return pymysql.connect(
            host='localhost',
            user='root',
            password='Balu@6688',  # Update with your MySQL root password
            db='ecommerce',
            cursorclass=pymysql.cursors.DictCursor
        )

    def is_admin(self):
        role = self.get_cookie("role")
        return role == "admin"

    def save_uploaded_file(self, file_info):
        if not file_info or not file_info.filename:
            return None
        # Basic sanitization (prod: add type/size checks)
        filename = file_info.filename
        safe_filename = "".join(c for c in filename if c.isalnum() or c in '.-_ ').rstrip()
        if '.' in safe_filename:
            name, ext = safe_filename.rsplit('.', 1)
            safe_filename = f"{name}.{ext.lower()}"
        else:
            safe_filename += '.jpg'
        path = os.path.join(UPLOAD_DIR, safe_filename)
        with open(path, 'wb') as f:
            f.write(file_info.body)
        return f"uploads/{safe_filename}"

class RegisterHandler(BaseHandler):
    def post(self):
        try:
            data = tornado.escape.json_decode(self.request.body)
            username = data['username']
            email = data['email']
            password = hashlib.sha256(data['password'].encode()).hexdigest()
            role = data.get('role', 'user')  # Default to 'user' if not specified
            
            # Validate role
            if role not in ['user', 'admin']:
                self.write(json.dumps({'status': 'error', 'message': 'Invalid role'}))
                return
            
            with self.get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)",
                        (username, email, password, role)
                    )
                    conn.commit()
                    self.write(json.dumps({'status': 'success', 'role': role}))
        except pymysql.err.IntegrityError:
            self.write(json.dumps({'status': 'error', 'message': 'Username or email already exists'}))
        except Exception as e:
            self.write(json.dumps({'status': 'error', 'message': str(e)}))

class LoginHandler(BaseHandler):
    def post(self):
        try:
            data = tornado.escape.json_decode(self.request.body)
            username = data['username']
            password = hashlib.sha256(data['password'].encode()).hexdigest()
            
            with self.get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT id, role FROM users WHERE username = %s AND password = %s",
                        (username, password)
                    )
                    result = cur.fetchone()
                    if result:
                        self.set_cookie("user_id", str(result['id']))
                        self.set_cookie("role", result['role'])
                        self.write(json.dumps({'status': 'success', 'role': result['role']}))
                    else:
                        self.write(json.dumps({'status': 'error', 'message': 'Invalid credentials'}))
        except Exception as e:
            self.write(json.dumps({'status': 'error', 'message': str(e)}))

class LogoutHandler(BaseHandler):
    def post(self):
        self.clear_cookie("user_id")
        self.clear_cookie("role")
        self.write(json.dumps({'status': 'success'}))

class ProductsHandler(BaseHandler):
    def get(self):
        with self.get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM products")
                products = cur.fetchall()
                products = [{**p, 'price': float(p['price'])} for p in products]
                self.write(json.dumps({'products': products}))

    def post(self):  # Admin add product
        if not self.is_admin():
            self.set_status(403)
            self.write(json.dumps({'error': 'Admin only'}))
            return
        try:
            name = self.get_argument('name')
            price = float(self.get_argument('price'))
            description = self.get_argument('description')
            image_path = None
            if 'image' in self.request.files:
                file_info = self.request.files['image'][0]
                image_path = self.save_uploaded_file(file_info)
            with self.get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT INTO products (name, price, description, image_url) VALUES (%s, %s, %s, %s)",
                        (name, price, description, image_path)
                    )
                    conn.commit()
                    self.write(json.dumps({'status': 'success'}))
        except Exception as e:
            self.set_status(400)
            self.write(json.dumps({'error': str(e)}))

class ProductHandler(BaseHandler):
    def get(self, product_id):
        with self.get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM products WHERE id = %s", (product_id,))
                product = cur.fetchone()
                if product:
                    product = {**product, 'price': float(product['price'])}
                    self.write(json.dumps({'product': product}))
                else:
                    self.set_status(404)
                    self.write(json.dumps({'error': 'Product not found'}))

    def delete(self, product_id):  # Admin delete
        if not self.is_admin():
            self.set_status(403)
            self.write(json.dumps({'error': 'Admin only'}))
            return
        try:
            product_id = int(product_id)
            with self.get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM products WHERE id = %s", (product_id,))
                    conn.commit()
                    self.write(json.dumps({'status': 'success'}))
        except Exception as e:
            self.set_status(400)
            self.write(json.dumps({'error': str(e)}))
    def put(self, product_id):  # Admin edit price
        if not self.is_admin():
            self.set_status(403)
            self.write(json.dumps({'error': 'Admin only'}))
            return
        try:
            data = tornado.escape.json_decode(self.request.body)  # Parse JSON from body
            new_price = data['price']
            product_id = int(product_id)
            with self.get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute("UPDATE products SET price = %s WHERE id = %s", (new_price, product_id))
                    conn.commit()
                    self.write(json.dumps({'status': 'success'}))
        except Exception as e:
            self.set_status(400)
            self.write(json.dumps({'error': str(e)}))

class CartHandler(BaseHandler):
    def get(self):
        user_id_str = self.get_cookie("user_id")
        if not user_id_str:
            self.write(json.dumps({'cart': []}))
            return
        user_id = int(user_id_str)
        with self.get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.description, p.image_url
                    FROM cart c
                    JOIN products p ON c.product_id = p.id
                    WHERE c.user_id = %s
                """, (user_id,))
                cart_items = cur.fetchall()
                cart_items = [{**item, 'price': float(item['price'])} for item in cart_items]
                self.write(json.dumps({'cart': cart_items}))

    def post(self):
        user_id_str = self.get_cookie("user_id")
        if not user_id_str:
            self.set_status(401)
            self.write(json.dumps({'error': 'Not logged in'}))
            return
        user_id = int(user_id_str)
        try:
            data = tornado.escape.json_decode(self.request.body)
            product_id = data['product_id']
            quantity = data.get('quantity', 1)
            with self.get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT id FROM cart WHERE user_id = %s AND product_id = %s", (user_id, product_id))
                    existing = cur.fetchone()
                    if existing:
                        cur.execute("UPDATE cart SET quantity = quantity + %s WHERE id = %s", (quantity, existing['id']))
                    else:
                        cur.execute("INSERT INTO cart (user_id, product_id, quantity) VALUES (%s, %s, %s)", (user_id, product_id, quantity))
                    conn.commit()
                    self.write(json.dumps({'status': 'success'}))
        except Exception as e:
            self.set_status(400)
            self.write(json.dumps({'error': str(e)}))

class DeleteCartHandler(BaseHandler):
    def delete(self, product_id):
        user_id_str = self.get_cookie("user_id")
        if not user_id_str:
            self.set_status(401)
            self.write(json.dumps({'error': 'Not logged in'}))
            return
        user_id = int(user_id_str)
        try:
            product_id = int(product_id)
            with self.get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM cart WHERE user_id = %s AND product_id = %s", (user_id, product_id))
                    conn.commit()
                    self.write(json.dumps({'status': 'success'}))
        except Exception as e:
            self.set_status(400)
            self.write(json.dumps({'error': str(e)}))

def make_app():
    return tornado.web.Application([
        (r"/register", RegisterHandler),
        (r"/login", LoginHandler),
        (r"/logout", LogoutHandler),
        (r"/products", ProductsHandler),
        (r"/products/([0-9]+)", ProductHandler),
        (r"/cart", CartHandler),
        (r"/cart/([0-9]+)", DeleteCartHandler),
        (r"/uploads/(.*)", tornado.web.StaticFileHandler, {"path": UPLOAD_DIR}),
    ])

if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    print("Backend server running on http://localhost:8888")
    tornado.ioloop.IOLoop.current().start()