// cSpell:ignore Workwear Kurta Boho Kanchipuram Banarasi Sherwani Lehenga
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
// cSpell:ignore pincode
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import cors from "cors";

import User from "./models/User.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Review from "./models/Review.js";
import Coupon from "./models/Coupon.js";
import Address from "./models/Address.js";
import Cart from "./models/Cart.js";
import Payment from "./models/Payment.js";
import Shipment from "./models/Shipment.js";

// Simulated OTP Store
const otpStore = new Map<string, string>();

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "lily_boutique_secret_123";

// ─── Database State ──────────────────────────────────────────────────────────
const localDb = new Database("lily_boutique_local.db");
let useLocalDb = false;

// ─── Seed Data Constants ────────────────────────────────────────────────────
const CATEGORY_NAMES = ["Dresses", "Tops", "Bottoms", "Accessories", "Outerwear", "Ethnic Wear", "Party Wear", "Casual Wear", "Workwear", "Footwear", "Spring Arrivals", "Summer Essentials", "Autumn Edit", "Customized Outfits", "Sarees", "Kids Wear", "Rental Costumes"];
const PRODUCTS = [
  { name: "Floral Summer Dress", price: 2499, category: "Dresses", stock: 15, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800" },
  { name: "Silk Blouse", price: 1899, category: "Tops", stock: 10, image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&q=80&w=800" },
  { name: "High-Waist Trousers", price: 2199, category: "Bottoms", stock: 20, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800" },
  { name: "Gold Pendant Necklace", price: 899, category: "Accessories", stock: 50, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800" },
  { name: "Velvet Evening Gown", price: 5499, category: "Party Wear", stock: 8, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800" },
  { name: "Designer Silk Saree", price: 8999, category: "Ethnic Wear", stock: 5, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800" },
  { name: "Embroidered Kurta Set", price: 3299, category: "Ethnic Wear", stock: 12, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800" },
  { name: "Sequin Cocktail Dress", price: 4599, category: "Party Wear", stock: 10, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800" },
  { name: "Cashmere Overcoat", price: 7499, category: "Outerwear", stock: 6, image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800" },
  { name: "Boho Maxi Dress", price: 2899, category: "Dresses", stock: 15, image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&q=80&w=800" },
  { name: "Linen Shirt Dress", price: 1999, category: "Casual Wear", stock: 25, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800" },
  { name: "Tailored Blazer", price: 3499, category: "Workwear", stock: 12, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800" },
  { name: "Leather Stiletto Heels", price: 2999, category: "Footwear", stock: 10, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800" },
  { name: "Pastel Floral Blouse", price: 1599, category: "Spring Arrivals", stock: 18, image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&q=80&w=800" },
  { name: "Straw Sun Hat", price: 1299, category: "Summer Essentials", stock: 30, image: "https://images.unsplash.com/photo-1572451479139-6a308211d8be?auto=format&fit=crop&q=80&w=800" },
  { name: "Woolen Scarf", price: 999, category: "Autumn Edit", stock: 25, image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800" },
  { name: "Kanchipuram Silk Saree", price: 12499, category: "Sarees", stock: 5, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800" },
  { name: "Banarasi Weave Saree", price: 8999, category: "Sarees", stock: 8, image: "https://images.unsplash.com/photo-1610030469668-935102a9e55c?auto=format&fit=crop&q=80&w=800" },
  { name: "Kids Floral Frock", price: 1499, category: "Kids Wear", stock: 20, image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800" },
  { name: "Little Prince Sherwani", price: 2999, category: "Kids Wear", stock: 12, image: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?auto=format&fit=crop&q=80&w=800" },
  { name: "Custom Bridal Lehenga", price: 25000, category: "Customized Outfits", stock: 1, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800" },
  { name: "Bespoke Evening Gown", price: 15000, category: "Customized Outfits", stock: 1, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800" },
  { name: "Premium Wedding Sherwani (Rental)", price: 3500, category: "Rental Costumes", stock: 3, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800" },
  { name: "Designer Party Gown (Rental)", price: 2500, category: "Rental Costumes", stock: 4, image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800" },
];

// ─── Express App & Middleware ───────────────────────────────────────────────
const app = express();
app.use(cors()); // Allow all origins for now; Render/Vercel handles specific security
app.use(express.json());

const authenticate = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
};

// ─── Helper Functions for Local Fallback ────────────────────────────────────
function initLocalDb() {
  localDb.exec(`
    CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT, slug TEXT, parent_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, slug TEXT, description TEXT, price REAL, sale_price REAL, category_name TEXT, category_id INTEGER, brand_id INTEGER, image_url TEXT, stock INTEGER, sku TEXT, status TEXT DEFAULT 'active', is_featured INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, phone TEXT, password TEXT, role TEXT, status TEXT DEFAULT 'active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS addresses (id INTEGER PRIMARY KEY, user_id INTEGER, full_name TEXT, phone TEXT, address_line TEXT, city TEXT, state TEXT, pincode TEXT, country TEXT, landmark TEXT, is_default INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS carts (id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS cart_items (id INTEGER PRIMARY KEY, cart_id INTEGER, product_id INTEGER, variant_id INTEGER, quantity INTEGER, price REAL, size TEXT, color TEXT);
    CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, order_number TEXT UNIQUE, user_id INTEGER, address_id INTEGER, total_amount REAL, discount_amount REAL, shipping_fee REAL, final_amount REAL, phone TEXT, address TEXT, payment_method TEXT, payment_status TEXT DEFAULT 'pending', status TEXT DEFAULT 'pending', return_status TEXT DEFAULT 'none', return_reason TEXT, tracking_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, name TEXT, quantity INTEGER, price REAL, size TEXT, color TEXT);
    CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY, order_id INTEGER, payment_method TEXT, payment_gateway TEXT, transaction_id TEXT, amount REAL, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS shipments (id INTEGER PRIMARY KEY, order_id INTEGER, shipping_method_id INTEGER, tracking_number TEXT, shipment_status TEXT DEFAULT 'pending', shipped_at DATETIME, delivered_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY, product_id TEXT, user_name TEXT, rating INTEGER, comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  `);
  
  const count = localDb.prepare("SELECT count(*) as count FROM categories").get() as any;
  if (count.count === 0) {
    CATEGORY_NAMES.forEach(n => localDb.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run(n, n.toLowerCase().replace(/ /g, "-")));
    const adminPass = bcrypt.hashSync("admin123", 10);
    localDb.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run("Admin", "admin@lilyboutique.com", adminPass, "admin");
    
    PRODUCTS.forEach(p => {
      localDb.prepare("INSERT INTO products (name, price, category_name, image_url, stock, is_featured) VALUES (?, ?, ?, ?, ?, ?)")
        .run(p.name, p.price, p.category, p.image, p.stock, 1);
    });
  }
}

// ─── API Routes ─────────────────────────────────────────────────────────────

app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    if (useLocalDb) {
      const result = localDb.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(name, email, hashedPassword, "user");
      const token = jwt.sign({ id: result.lastInsertRowid, email, role: "user" }, JWT_SECRET);
      return res.json({ token, user: { id: result.lastInsertRowid, name, email, role: "user" } });
    }
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id, email, role: "user" }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name, email, role: "user" } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (useLocalDb) {
    const user = localDb.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// ─── Address Management ─────────────────────────────────────────────────────
app.get("/api/addresses", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  if (useLocalDb) {
    const data = localDb.prepare("SELECT * FROM addresses WHERE user_id = ?").all(userId);
    return res.json(data);
  }
  const data = await Address.find({ userId });
  res.json(data);
});

app.post("/api/addresses", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { fullName, phone, addressLine, city, state, pincode, landmark, isDefault } = req.body;
  
  if (useLocalDb) {
    if (isDefault) localDb.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(userId);
    const result = localDb.prepare("INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode, landmark, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(userId, fullName, phone, addressLine, city, state, pincode, landmark, isDefault ? 1 : 0);
    return res.json({ id: result.lastInsertRowid, success: true });
  }
  
  if (isDefault) await Address.updateMany({ userId }, { isDefault: false });
  const address = await Address.create({ userId, fullName, phone, addressLine, city, state, pincode, landmark, isDefault });
  res.json(address);
});

// ─── Persistent Cart Management ─────────────────────────────────────────────
app.get("/api/cart", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  if (useLocalDb) {
    const cart = localDb.prepare("SELECT id FROM carts WHERE user_id = ?").get(userId) as any;
    if (!cart) return res.json({ items: [] });
    const items = localDb.prepare("SELECT * FROM cart_items WHERE cart_id = ?").all(cart.id);
    return res.json({ items });
  }
  const cart = await Cart.findOne({ userId });
  res.json(cart || { items: [] });
});

app.post("/api/cart/sync", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { items } = req.body; // Array of cart items

  if (useLocalDb) {
    const transaction = localDb.transaction(() => {
      let cart = localDb.prepare("SELECT id FROM carts WHERE user_id = ?").get(userId) as any;
      if (!cart) {
        const result = localDb.prepare("INSERT INTO carts (user_id) VALUES (?)").run(userId);
        cart = { id: result.lastInsertRowid };
      }
      localDb.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(cart.id);
      items.forEach((item: any) => {
        localDb.prepare("INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price, size, color) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(cart.id, item.id, item.variantId, item.quantity, item.price, item.size, item.color);
      });
    });
    transaction();
    return res.json({ success: true });
  }

  await Cart.findOneAndUpdate({ userId }, { items: items.map((i: any) => ({ ...i, productId: i.id })) }, { upsert: true });
  res.json({ success: true });
});

// ─── OTP Verification ────────────────────────────────────────────────────────
app.post("/api/auth/send-otp", (req: Request, res: Response) => {
  console.log("POST /api/auth/send-otp", req.body);
  const { phone } = req.body;
  if (!phone) {
    console.error("Missing phone number");
    return res.status(400).json({ error: "Phone number required" });
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, otp);
  console.log(`[Lily Boutique] OTP for ${phone}: ${otp}`); // Simulated SMS
  res.json({ success: true, message: "OTP sent successfully", mockOtp: otp });
});

app.post("/api/auth/verify-otp", (req: Request, res: Response) => {
  console.log("POST /api/auth/verify-otp", req.body);
  const { phone, otp } = req.body;
  const storedOtp = otpStore.get(phone);
  console.log("Stored OTP:", storedOtp, "Received OTP:", otp);
  if (storedOtp && storedOtp === otp) {
    otpStore.delete(phone);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid or expired OTP" });
  }
});

app.get("/api/products", async (_req: Request, res: Response) => {
  if (useLocalDb) {
    const products = localDb.prepare("SELECT * FROM products").all();
    return res.json(products);
  }
  const products = await Product.find().lean();
  res.json(products.map((p: any) => ({ ...p, id: p._id, image_url: p.imageUrl, category_name: p.categoryName })));
});

app.get("/api/products/:id", async (req: Request, res: Response) => {
  if (useLocalDb) {
    const product = localDb.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    return res.json(product);
  }
  const product = await Product.findById(req.params.id).lean() as any;
  res.json({ ...product, id: product._id, image_url: product.imageUrl, category_name: product.categoryName });
});

app.get("/api/categories", async (_req: Request, res: Response) => {
  if (useLocalDb) return res.json(localDb.prepare("SELECT * FROM categories").all());
  const categories = await Category.find().lean();
  res.json(categories.map((c: any) => ({ ...c, id: c._id })));
});

// ─── Reviews ─────────────────────────────────────────────────────────────────
app.get("/api/products/:id/reviews", async (req: Request, res: Response) => {
  if (useLocalDb) {
    const reviews = localDb.prepare("SELECT * FROM reviews WHERE product_id = ?").all(req.params.id);
    return res.json(reviews);
  }
  const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 }).lean();
  res.json(reviews.map((r: any) => ({ ...r, id: r._id, user_name: r.userName })));
});

app.post("/api/products/:id/reviews", authenticate, async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const userId = (req as any).user.id;
  if (useLocalDb) {
    const user = localDb.prepare("SELECT name FROM users WHERE id = ?").get(userId) as any;
    localDb.prepare("INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)").run(req.params.id, user?.name, rating, comment);
    return res.json({ success: true });
  }
  const user = await User.findById(userId);
  await Review.create({ productId: req.params.id, userId, userName: user?.name, rating, comment });
  res.json({ success: true });
});

// ─── Products Management ──────────────────────────────────────────────────────
app.get("/api/admin/analytics", authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    if (useLocalDb) {
      const orders = localDb.prepare("SELECT COUNT(*) as count, SUM(final_amount) as total FROM orders WHERE return_status != 'approved' OR return_status IS NULL").get() as any;
      const users = localDb.prepare("SELECT COUNT(*) as count FROM users").get() as any;
      const recentOrders = localDb.prepare("SELECT o.id, o.final_amount as total_amount, o.status, o.created_at, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5").all();
      const returnRequests = localDb.prepare("SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.return_status = 'requested' ORDER BY o.created_at DESC").all();
      return res.json({ 
        orderCount: orders?.count || 0, 
        totalSales: orders?.total || 0, 
        userCount: users?.count || 0,
        recentOrders: recentOrders || [],
        returnRequests: returnRequests || []
      });
    }

    const validOrderQuery = { returnStatus: { $ne: 'approved' } };
    const orderCount = await Order.countDocuments(validOrderQuery);
    const revenueStats = await Order.aggregate([
      { $match: validOrderQuery },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } }
    ]);
    const totalSales = revenueStats[0]?.total || 0;
    const userCount = await User.countDocuments();
    const recentDbOrders = await Order.find().populate("userId", "name").sort({ createdAt: -1 }).limit(5).lean();
    const recentOrders = recentDbOrders.map((o: any) => ({
      id: o._id,
      user_name: o.userId?.name || "Unknown",
      total_amount: o.finalAmount,
      status: o.status,
      created_at: o.createdAt
    }));
    const returnDbRequests = await Order.find({ returnStatus: 'requested' }).populate("userId", "name").sort({ createdAt: -1 }).lean();
    const returnRequests = returnDbRequests.map((o: any) => ({
      ...o, id: o._id, user_name: o.userId?.name, return_status: o.returnStatus, return_reason: o.returnReason
    }));

    res.json({ orderCount, totalSales, userCount, recentOrders, returnRequests });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/products", authenticate, isAdmin, async (req: Request, res: Response) => {
  const { name, description, price, category_id, image_url, stock, is_featured } = req.body;
  if (useLocalDb) {
    const cat = localDb.prepare("SELECT name FROM categories WHERE id = ?").get(category_id) as any;
    const result = localDb.prepare("INSERT INTO products (name, description, price, category_id, category_name, image_url, stock, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(name, description, price, category_id, cat?.name, image_url, stock, is_featured ? 1 : 0);
    return res.json({ id: result.lastInsertRowid });
  }
  const cat = await Category.findById(category_id);
  const product = await Product.create({ name, description, price, categoryId: category_id, categoryName: cat?.name, imageUrl: image_url, stock, isFeatured: !!is_featured });
  res.json({ id: product._id });
});

// ─── Checkout / Orders ────────────────────────────────────────────────────────
app.post("/api/checkout", authenticate, async (req: Request, res: Response) => {
  const { items, address, payment_method, phone, fullName, addressId } = req.body;
  const userId = (req as any).user.id;
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const trackingId = `LB${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const total = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const shippingFee = total > 2999 ? 0 : 150;
  const finalAmount = total + shippingFee;

  if (useLocalDb) {
    for (const item of items) {
      const product = localDb.prepare("SELECT stock FROM products WHERE id = ?").get(item.id) as any;
      if (!product || product.stock < item.quantity) return res.status(400).json({ error: `Product ${item.name} is out of stock.` });
    }

    const transaction = localDb.transaction(() => {
      const result = localDb.prepare("INSERT INTO orders (order_number, user_id, address_id, total_amount, shipping_fee, final_amount, phone, address, payment_method, tracking_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(orderNumber, userId, addressId || null, total, shippingFee, finalAmount, phone, address, payment_method, trackingId, "confirmed");
      const orderId = result.lastInsertRowid;
      
      items.forEach((item: any) => {
        localDb.prepare("INSERT INTO order_items (order_id, product_id, name, quantity, price, size, color) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(orderId, item.id, item.name, item.quantity, item.price, item.size, item.color);
        localDb.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(item.quantity, item.id);
      });

      localDb.prepare("INSERT INTO payments (order_id, payment_method, amount, status) VALUES (?, ?, ?, ?)")
        .run(orderId, payment_method, finalAmount, payment_method === "COD" ? "pending" : "successful");
      
      localDb.prepare("INSERT INTO shipments (order_id, tracking_number, shipment_status) VALUES (?, ?, ?)")
        .run(orderId, trackingId, "pending");

      return { orderId, trackingId };
    });

    const result = transaction();
    return res.json({ ...result, success: true });
  }

  // MongoDB
  try {
    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product || (product.stock ?? 0) < item.quantity) return res.status(400).json({ error: `Product ${item.name} is out of stock.` });
    }

    const order = await Order.create({
      orderNumber, userId, addressId, totalAmount: total, shippingFee, finalAmount, phone, address, paymentMethod: payment_method, trackingId, status: "confirmed"
    });

    await Payment.create({
      orderId: order._id, paymentMethod: payment_method, amount: finalAmount, status: payment_method === "COD" ? "pending" : "successful"
    });

    await Shipment.create({
      orderId: order._id, trackingNumber: trackingId, shipmentStatus: "pending"
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.quantity } });
    }

    res.json({ orderId: order._id, trackingId, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Returns ───────────────────────────────────────────────────────────────────
app.post("/api/orders/:id/return", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const orderId = req.params.id;
  const { reason } = req.body;

  try {
    if (useLocalDb) {
      // Basic check
      const order = localDb.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(orderId, userId) as any;
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (order.status !== "delivered") return res.status(400).json({ error: "Only delivered orders can be returned" });
      
      localDb.prepare("UPDATE orders SET return_status = 'requested', return_reason = ? WHERE id = ?").run(reason, orderId);
      return res.json({ success: true, returnStatus: 'requested' });
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "delivered") return res.status(400).json({ error: "Only delivered orders can be returned" });

    order.returnStatus = 'requested';
    order.returnReason = reason;
    await order.save();
    
    res.json({ success: true, returnStatus: 'requested' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/orders/:id/return-status", authenticate, isAdmin, async (req: Request, res: Response) => {
  const orderId = req.params.id;
  const { status } = req.body; // 'approved' or 'rejected'
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid return status" });
  }

  try {
    if (useLocalDb) {
      localDb.prepare("UPDATE orders SET return_status = ? WHERE id = ?").run(status, orderId);
      return res.json({ success: true, returnStatus: status });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.returnStatus = status;
    await order.save();
    
    // In a real app, you would process refund logic here if approved
    
    res.json({ success: true, returnStatus: status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/orders", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const role = (req as any).user.role;
  if (useLocalDb) {
    const orders = role === "admin" 
      ? localDb.prepare("SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC").all()
      : localDb.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    return res.json(orders);
  }
  if (role === "admin") {
    const orders = await Order.find().populate("userId", "name").sort({ createdAt: -1 }).lean();
    res.json(orders.map((o: any) => ({ ...o, id: o._id, user_name: o.userId?.name, return_status: o.returnStatus, return_reason: o.returnReason })));
  } else {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(orders.map((o: any) => ({ ...o, id: o._id, return_status: o.returnStatus, return_reason: o.returnReason })));
  }
});

// ─── Start Server Logic ─────────────────────────────────────────────────────
async function startServer() {
  const uri = process.env.MONGO_URI;
  try {
    if (!uri) throw new Error("No MONGO_URI in .env");
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 5000,
      family: 4 
    });
    console.log("✅ Connected to MongoDB Atlas");
    
    // Seed MongoDB
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Seeding MongoDB...");
      const adminPass = bcrypt.hashSync("admin123", 10);
      await User.create({ name: "Admin", email: "admin@lilyboutique.com", password: adminPass, role: "admin" });
      for (const n of CATEGORY_NAMES) await Category.findOneAndUpdate({ name: n }, { name: n, slug: n.toLowerCase().replace(/ /g, "-") }, { upsert: true });
      for (const p of PRODUCTS) {
        const cat = await Category.findOne({ name: p.category });
        await Product.create({ name: p.name, price: p.price, categoryId: cat?._id, categoryName: cat?.name, imageUrl: p.image, stock: p.stock, isFeatured: true });
      }
      console.log("✨ MongoDB Seeded Successfully");
    }
  } catch (err) {
    console.error("❌ MongoDB Access Blocked:", (err as Error).message);
    console.log("🚀 Switching to Local Mode (SQLite) - Bypassing network issues...");
    useLocalDb = true;
    initLocalDb();
  }

  // API Only Backend - Frontend is hosted purely on Vercel

  const PORT = parseInt(process.env.PORT || '5000', 10);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n--------------------------------------------`);
    console.log(`🚀 Lily Boutique Live: Port ${PORT}`);
    console.log(`📦 Database: ${useLocalDb ? "Local SQLite" : "Cloud MongoDB"}`);
    console.log(`--------------------------------------------\n`);
  });
}

startServer().catch(console.error);
