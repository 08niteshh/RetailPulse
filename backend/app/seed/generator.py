import random
import datetime
from datetime import timedelta
import numpy as np
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.models import (
    User, Region, Store, Category, Product, Customer, Order, OrderItem, Inventory, ActivityLog
)
from app.core.security import get_password_hash

# Categories and their product templates (Configured in Indian Rupees INR ₹)
CATEGORY_DATA = [
    {
        "name": "Electronics & Smart Devices", "code": "ELEC", "target_margin": 28.0,
        "products": [
            ("Noise-Cancelling Wireless Headphones Pro", 3500.0, 7999.0, 15, 80, 5),
            ("Smart 4K Ultra HD OLED TV 55-inch", 24000.0, 42999.0, 8, 40, 7),
            ("Ergonomic Mechanical Gaming Keyboard RGB", 1600.0, 3499.0, 25, 120, 4),
            ("Ultra-Slim Core i7 16GB RAM Laptop", 42000.0, 68999.0, 10, 50, 6),
            ("True Wireless Bass Earbuds with ANC", 850.0, 2499.0, 30, 150, 3),
            ("Smart Fitness Watch with AMOLED & SpO2", 2100.0, 4999.0, 20, 90, 4),
            ("Fast Charging 20000mAh Power Bank", 650.0, 1899.0, 40, 200, 3),
            ("Smart Home Voice Assistant Speaker", 1200.0, 2999.0, 35, 160, 4),
            ("4K Waterproof Action Camera", 4200.0, 9999.0, 15, 75, 5),
            ("Type-C 7-in-1 Multiport Docking Hub", 550.0, 1499.0, 50, 250, 3),
            ("Precision Wireless Optical Gaming Mouse", 600.0, 1599.0, 30, 140, 3),
            ("Smart WiFi 360 Degree Security Camera", 1100.0, 2499.0, 20, 100, 4),
            ("Dolby Soundbar with Wireless Subwoofer", 4500.0, 10999.0, 12, 60, 6),
            ("Qi Fast Wireless Desktop Charger", 450.0, 1199.0, 45, 180, 3),
            ("Digital Drawing Stylus Tablet 10-inch", 2800.0, 5999.0, 15, 70, 5),
        ]
    },
    {
        "name": "Ethnic & Modern Apparel", "code": "APP", "target_margin": 52.0,
        "products": [
            ("Pure Cotton Handloom Kurta & Pyjama Set", 450.0, 1499.0, 50, 300, 4),
            ("Slim-Fit Stretch Denim Jeans", 650.0, 1899.0, 40, 220, 4),
            ("Handcrafted Kashmiri Embroidered Pashmina Shawl", 1200.0, 3499.0, 25, 140, 5),
            ("Lightweight All-Weather Rain Windcheater", 750.0, 1999.0, 20, 100, 5),
            ("Breathable Activewear Performance Track Pants", 350.0, 999.0, 45, 200, 3),
            ("Classic Royal Tailored Nehru Jacket", 1100.0, 2999.0, 15, 80, 6),
            ("High-Waist Stretchable Yoga Leggings", 380.0, 1099.0, 40, 220, 3),
            ("Lightweight Breathable Running Shoes", 950.0, 2499.0, 30, 160, 5),
            ("Premium Khadi Linen Casual Shirt", 500.0, 1499.0, 35, 180, 4),
            ("Winter Fleece Zip Pullover Hoodie", 600.0, 1699.0, 30, 150, 4),
            ("Genuine Handcrafted Leather Belt", 280.0, 799.0, 40, 180, 3),
            ("Bamboo Fiber Cushioned Ankle Socks (Pack of 3)", 150.0, 449.0, 60, 350, 2),
        ]
    },
    {
        "name": "Home, Kitchen & Living", "code": "HOME", "target_margin": 42.0,
        "products": [
            ("Tri-Ply Stainless Steel Heavy Kadai 2.5L", 950.0, 2499.0, 30, 150, 4),
            ("Digital Touch Air Fryer 5.5L 1500W", 2600.0, 5999.0, 20, 110, 5),
            ("Hard Anodized Pressure Cooker 5L", 850.0, 2199.0, 12, 65, 5),
            ("Instant Auto-Cut Electric Kettle 1.8L", 480.0, 1299.0, 25, 130, 4),
            ("Ultrasonic Aroma Essential Oil Diffuser", 420.0, 1199.0, 40, 200, 3),
            ("Orthopedic Memory Foam Contour Pillow", 550.0, 1499.0, 35, 180, 4),
            ("Pure Cotton King Size Bedsheet with Pillow Covers", 480.0, 1299.0, 30, 160, 4),
            ("Smart Robotic Vacuum & Mop Cleaner", 11500.0, 22999.0, 10, 50, 7),
            ("Heavy-Duty 750W Mixer Grinder (3 Jars)", 1500.0, 3699.0, 18, 90, 5),
            ("Non-Stick Granite Dosa Tawa & Pan Combo", 650.0, 1699.0, 22, 110, 4),
        ]
    },
    {
        "name": "Ayurveda, Health & Beauty", "code": "BEAUTY", "target_margin": 58.0,
        "products": [
            ("Kumkumadi Miraculous Radiant Face Oil 30ml", 350.0, 999.0, 50, 260, 3),
            ("Organic Neem & Tea Tree Purifying Face Wash", 110.0, 349.0, 55, 280, 2),
            ("SPF 50 PA++++ Matte Finish Sunscreen Gel", 190.0, 549.0, 60, 300, 3),
            ("Rechargeable Sonic Electric Toothbrush", 600.0, 1599.0, 25, 130, 4),
            ("Pure Cold-Pressed Bhringraj Hair Oil 200ml", 140.0, 399.0, 45, 220, 3),
            ("Deep Tissue Cordless Percussion Body Massager", 1400.0, 3499.0, 18, 90, 5),
            ("Pure Himalayan Shilajit & Ashwagandha Resin", 380.0, 999.0, 40, 190, 3),
            ("Aromatic Natural Soy Wax Diya Candles Gift Set", 220.0, 599.0, 45, 210, 2),
        ]
    },
    {
        "name": "Sports, Fitness & Outdoors", "code": "SPORT", "target_margin": 38.0,
        "products": [
            ("Hex Rubber-Coated Dumbbells Set 10kg Pair", 1300.0, 2999.0, 12, 60, 6),
            ("High-Density Eco TPE Yoga Mat 6mm with Strap", 380.0, 999.0, 40, 190, 3),
            ("Grade-1 Kashmir Willow Cricket Bat", 950.0, 2499.0, 15, 75, 5),
            ("Insulated Stainless Steel Sipper Bottle 1000ml", 260.0, 699.0, 50, 250, 3),
            ("Aerodynamic ISI Certified Bicycle Helmet", 650.0, 1699.0, 25, 120, 4),
            ("Heavy-Duty Resistance Loop Bands Set of 5", 280.0, 749.0, 60, 300, 3),
            ("Ergonomic Travel Hiking Rucksack 50L", 850.0, 2199.0, 30, 150, 4),
            ("Waterproof Compact Trekking Tent (2 Person)", 1600.0, 3899.0, 40, 200, 4),
        ]
    },
    {
        "name": "Spices, Groceries & Gourmet", "code": "GROC", "target_margin": 22.0,
        "products": [
            ("Single-Estate Coorg Arabica Filter Coffee 500g", 240.0, 549.0, 60, 350, 2),
            ("Cold-Pressed Wood Churned Mustard Oil 1L", 160.0, 349.0, 50, 260, 3),
            ("Pure Kashmiri Mongra Saffron & Forest Honey 500g", 320.0, 799.0, 55, 280, 3),
            ("Organic Himalayan Green Tea Leaves 250g", 180.0, 449.0, 40, 200, 3),
            ("Handmade Roasted Almond Dark Chocolate Box", 160.0, 399.0, 50, 240, 2),
            ("Healthy Roasted Millets & Quinoa Namkeen 400g", 95.0, 249.0, 65, 360, 2),
        ]
    },
    {
        "name": "Stationery & Desk Essentials", "code": "BOOK", "target_margin": 45.0,
        "products": [
            ("Hardbound Dotted Executive Notebook 200 Pages", 160.0, 449.0, 60, 320, 2),
            ("Smooth Quick-Dry Gel Pens (Set of 10)", 90.0, 249.0, 70, 380, 2),
            ("Undated Daily Goal & Habit Planner", 140.0, 379.0, 50, 250, 3),
            ("Rechargeable LED Eye-Protection Desk Lamp", 420.0, 1099.0, 20, 110, 4),
            ("Bestseller: Indian Startups & Analytics Playbook", 190.0, 499.0, 40, 200, 3),
            ("Foldable Aluminium Laptop & Tablet Stand", 380.0, 999.0, 35, 170, 3),
        ]
    },
    {
        "name": "Automotive & Tools", "code": "AUTO", "target_margin": 36.0,
        "products": [
            ("Digital Portable Car Tyre Inflator 150 PSI", 750.0, 1999.0, 25, 130, 4),
            ("High-Power Cordless Handheld Car Vacuum", 550.0, 1499.0, 30, 150, 3),
            ("Universal OBD2 Car Diagnostic Bluetooth Scanner", 480.0, 1299.0, 35, 180, 3),
            ("All-in-One Mechanics Tool Box Kit 68-Piece", 850.0, 2299.0, 15, 75, 5),
            ("Custom-Fit Foldable Windshield Heat Sunshade", 180.0, 499.0, 50, 260, 2),
            ("Emergency Car Battery Jump Starter 12000mAh", 1500.0, 3999.0, 18, 90, 5),
        ]
    }
]

# Indian Regions and Stores (25 retail locations across 5 major zones)
REGIONS_DATA = [
    {
        "name": "North India", "code": "IND-NORTH", "manager": "Rajesh Sharma",
        "stores": [
            ("STR-N01", "New Delhi Connaught Place Flagship", "New Delhi", "DL", 16000, 850000.0),
            ("STR-N02", "Gurugram Cyber Hub Mega Store", "Gurugram", "HR", 14000, 780000.0),
            ("STR-N03", "Noida DLF Mall of India", "Noida", "UP", 12500, 680000.0),
            ("STR-N04", "Chandigarh Sector 17 Plaza", "Chandigarh", "CH", 10000, 540000.0),
            ("STR-N05", "Jaipur World Trade Park", "Jaipur", "RJ", 9500, 490000.0),
        ]
    },
    {
        "name": "West India", "code": "IND-WEST", "manager": "Priya Patel",
        "stores": [
            ("STR-W01", "Mumbai Bandra Linking Road", "Mumbai", "MH", 18000, 950000.0),
            ("STR-W02", "Mumbai Palladium Lower Parel", "Mumbai", "MH", 16500, 920000.0),
            ("STR-W03", "Pune Phoenix Marketcity", "Pune", "MH", 13000, 710000.0),
            ("STR-W04", "Ahmedabad SG Highway Galleria", "Ahmedabad", "GJ", 11500, 620000.0),
            ("STR-W05", "Surat VR Mall Ring Road", "Surat", "GJ", 9000, 480000.0),
        ]
    },
    {
        "name": "South India", "code": "IND-SOUTH", "manager": "Karthik Raman",
        "stores": [
            ("STR-S01", "Bengaluru Indiranagar 100ft Road", "Bengaluru", "KA", 17000, 910000.0),
            ("STR-S02", "Bengaluru Forum Koramangala", "Bengaluru", "KA", 15000, 840000.0),
            ("STR-S03", "Hyderabad Hitec City Cyber Towers", "Hyderabad", "TS", 14500, 790000.0),
            ("STR-S04", "Chennai Express Avenue T. Nagar", "Chennai", "TN", 12500, 660000.0),
            ("STR-S05", "Kochi Lulu Mall Edappally", "Kochi", "KL", 10500, 530000.0),
        ]
    },
    {
        "name": "East India", "code": "IND-EAST", "manager": "Sourav Banerjee",
        "stores": [
            ("STR-E01", "Kolkata South City Mall", "Kolkata", "WB", 15000, 740000.0),
            ("STR-E02", "Kolkata Park Street Boulevard", "Kolkata", "WB", 12000, 630000.0),
            ("STR-E03", "Bhubaneswar Esplanade One", "Bhubaneswar", "OD", 9500, 460000.0),
            ("STR-E04", "Patna City Centre Fraser Road", "Patna", "BR", 8500, 420000.0),
            ("STR-E05", "Guwahati City Centre GS Road", "Guwahati", "AS", 8000, 390000.0),
        ]
    },
    {
        "name": "Central India", "code": "IND-CENTRAL", "manager": "Amit Verma",
        "stores": [
            ("STR-C01", "Indore Treasure Island MG Road", "Indore", "MP", 12000, 580000.0),
            ("STR-C02", "Bhopal DB City Mall", "Bhopal", "MP", 10500, 510000.0),
            ("STR-C03", "Lucknow Phoenix Palassio", "Lucknow", "UP", 13000, 650000.0),
            ("STR-C04", "Nagpur Empress Mall Dharampeth", "Nagpur", "MH", 9500, 470000.0),
            ("STR-C05", "Raipur Magneto The Mall", "Raipur", "CG", 8500, 410000.0),
        ]
    }
]

FIRST_NAMES = [
    "Aarav", "Priya", "Rohan", "Sneha", "Vikram", "Ananya", "Aditya", "Pooja", "Nitesh", "Divya",
    "Rahul", "Meera", "Arjun", "Kavita", "Suresh", "Sunita", "Deepak", "Swati", "Siddharth", "Neha",
    "Manish", "Shweta", "Amit", "Ritu", "Gaurav", "Anjali", "Varun", "Simran", "Abhishek", "Payal",
    "Kunal", "Tanvi", "Sachin", "Deepika", "Mohit", "Preeti", "Karan", "Rashmi", "Naveen", "Jyoti",
    "Harsh", "Kiran", "Prateek", "Isha", "Ashish", "Shruti", "Vivek", "Pallavi", "Nikhil", "Shalini",
    "Rajesh", "Seema", "Alok", "Richa", "Sanjay", "Komal", "Mayank", "Bhavna", "Ankit", "Smriti"
]

LAST_NAMES = [
    "Sharma", "Patel", "Verma", "Singh", "Kumar", "Gupta", "Reddy", "Joshi", "Nair", "Banerjee",
    "Chatterjee", "Rao", "Mehta", "Das", "Shah", "Agarwal", "Mishra", "Yadav", "Iyer", "Choudhury",
    "Bhat", "Kulkarni", "Deshmukh", "Nambiar", "Mukherjee", "Kapoor", "Khanna", "Saxena", "Bose", "Pillai"
]

INDIAN_CITIES_STATES = [
    ("New Delhi", "Delhi"),
    ("Mumbai", "Maharashtra"),
    ("Bengaluru", "Karnataka"),
    ("Hyderabad", "Telangana"),
    ("Pune", "Maharashtra"),
    ("Chennai", "Tamil Nadu"),
    ("Kolkata", "West Bengal"),
    ("Ahmedabad", "Gujarat"),
    ("Jaipur", "Rajasthan"),
    ("Gurugram", "Haryana"),
    ("Noida", "Uttar Pradesh"),
    ("Chandigarh", "Chandigarh"),
    ("Lucknow", "Uttar Pradesh"),
    ("Indore", "Madhya Pradesh"),
    ("Kochi", "Kerala"),
    ("Bhopal", "Madhya Pradesh"),
    ("Surat", "Gujarat"),
    ("Nagpur", "Maharashtra"),
    ("Bhubaneswar", "Odisha"),
    ("Patna", "Bihar")
]

def seed_database(db: Session, target_transaction_count: int = 100000):
    """Seed database with realistic multi-year Indian retail transaction data in INR ₹."""
    print("Beginning database initialization & seeding (India Edition)...")
    Base.metadata.create_all(bind=engine)

    # 1. Create Default Users (Admin & Analyst)
    admin_user = db.query(User).filter(User.email == "admin@retailpulse.io").first()
    if not admin_user:
        admin_user = User(
            email="admin@retailpulse.io",
            hashed_password=get_password_hash("AdminPass123!"),
            full_name="Aarav Sharma (Executive Admin)",
            role="ADMIN",
            is_active=True
        )
        db.add(admin_user)
    else:
        admin_user.full_name = "Aarav Sharma (Executive Admin)"
        db.add(admin_user)

    analyst_user = db.query(User).filter(User.email == "analyst@retailpulse.io").first()
    if not analyst_user:
        analyst_user = User(
            email="analyst@retailpulse.io",
            hashed_password=get_password_hash("AnalystPass123!"),
            full_name="Priya Patel (Lead BI Analyst)",
            role="ANALYST",
            is_active=True
        )
        db.add(analyst_user)
    else:
        analyst_user.full_name = "Priya Patel (Lead BI Analyst)"
        db.add(analyst_user)

    db.commit()

    # 2. Check if data already exists
    order_count = db.query(Order).count()
    if order_count >= 10000:
        print(f"Database already populated with {order_count} orders. Skipping seed generation.")
        return

    print("Generating Master Data (Indian Regions, Stores, Categories, Products, Customers)...")

    # 3. Create Regions & Stores
    db_regions = []
    db_stores = []
    for r_data in REGIONS_DATA:
        region = db.query(Region).filter(Region.code == r_data["code"]).first()
        if not region:
            region = Region(
                name=r_data["name"],
                code=r_data["code"],
                manager_name=r_data["manager"]
            )
            db.add(region)
            db.flush()
        db_regions.append(region)

        for s_code, s_name, city, state, sqft, target in r_data["stores"]:
            store = db.query(Store).filter(Store.store_code == s_code).first()
            if not store:
                store = Store(
                    store_code=s_code,
                    name=s_name,
                    region_id=region.id,
                    city=city,
                    state=state,
                    square_footage=sqft,
                    target_monthly_sales=target
                )
                db.add(store)
                db.flush()
            db_stores.append(store)

    db.commit()

    # 4. Create Categories & Products
    db_categories = []
    db_products = []
    sku_counter = 1001

    for cat_data in CATEGORY_DATA:
        cat = db.query(Category).filter(Category.code == cat_data["code"]).first()
        if not cat:
            cat = Category(
                name=cat_data["name"],
                code=cat_data["code"],
                target_margin_pct=cat_data["target_margin"],
                description=f"Premium curated {cat_data['name']} selection."
            )
            db.add(cat)
            db.flush()
        db_categories.append(cat)

        for p_name, cost, price, min_reorder, target_stock, lead_time in cat_data["products"]:
            sku = f"SKU-{cat_data['code']}-{sku_counter}"
            sku_counter += 1
            prod = db.query(Product).filter(Product.sku == sku).first()
            if not prod:
                prod = Product(
                    sku=sku,
                    name=p_name,
                    category_id=cat.id,
                    unit_cost=cost,
                    unit_price=price,
                    min_reorder_level=min_reorder,
                    target_stock=target_stock,
                    lead_time_days=lead_time,
                    is_active=True
                )
                db.add(prod)
                db.flush()
            db_products.append(prod)

    # Synthetic catalog items
    for i in range(len(db_products), 120):
        cat = random.choice(db_categories)
        base_cost = round(random.uniform(200.0, 4500.0), 2)
        margin = random.uniform(0.25, 0.60)
        base_price = round(base_cost / (1 - margin), 2)
        sku = f"SKU-{cat.code}-{sku_counter}"
        sku_counter += 1
        prod_name = f"Premium {cat.name.split()[0]} Edition {sku_counter}"
        prod = Product(
            sku=sku,
            name=prod_name,
            category_id=cat.id,
            unit_cost=base_cost,
            unit_price=base_price,
            min_reorder_level=random.randint(15, 40),
            target_stock=random.randint(80, 250),
            lead_time_days=random.randint(3, 8),
            is_active=True
        )
        db.add(prod)
        db.flush()
        db_products.append(prod)

    db.commit()

    # 5. Initialize Inventory
    print("Initializing inventory levels across all 25 retail branches...")
    inventory_records = []
    for store in db_stores:
        for prod in db_products:
            stock_roll = random.random()
            if stock_roll < 0.03:
                curr_stock = 0
            elif stock_roll < 0.12:
                curr_stock = random.randint(1, prod.min_reorder_level - 1)
            else:
                curr_stock = random.randint(prod.min_reorder_level, prod.target_stock + 40)

            safety = max(5, int(prod.min_reorder_level * 0.5))
            inv = Inventory(
                store_id=store.id,
                product_id=prod.id,
                current_stock=curr_stock,
                reserved_stock=random.randint(0, min(curr_stock, 5)),
                reorder_point=prod.min_reorder_level,
                safety_stock=safety,
                last_restocked_at=datetime.datetime.utcnow() - timedelta(days=random.randint(1, 45))
            )
            inventory_records.append(inv)

    db.bulk_save_objects(inventory_records)
    db.commit()

    # 6. Create 1,500 realistic Customers across Indian locations
    print("Generating 1,500 customer profiles across India...")
    customer_records = []
    start_date_acq = datetime.datetime(2023, 1, 1)

    for i in range(1, 1501):
        f_name = random.choice(FIRST_NAMES)
        l_name = random.choice(LAST_NAMES)
        c_code = f"CUST-{i:05d}"
        email = f"{f_name.lower()}.{l_name.lower()}{i}@retailpulse.in"
        acq_date = start_date_acq + timedelta(days=random.randint(0, 900))
        city, state = random.choice(INDIAN_CITIES_STATES)
        cust = Customer(
            customer_code=c_code,
            first_name=f_name,
            last_name=l_name,
            email=email,
            phone=f"+91-{random.choice(['98', '97', '99', '94', '93'])}{random.randint(10000000, 99999999)}",
            city=city,
            state=state,
            segment="Regular",
            acquisition_date=acq_date
        )
        customer_records.append(cust)

    db.bulk_save_objects(customer_records)
    db.commit()
    db_customers = db.query(Customer).all()

    # 7. Generate realistic retail orders spanning Jan 2024 to mid 2026
    print(f"Generating realistic Indian retail transactions with festive peaks & seasons...")
    
    start_date = datetime.datetime(2024, 1, 1, 9, 0, 0)
    end_date = datetime.datetime(2026, 3, 15, 21, 0, 0)
    total_days = (end_date - start_date).days

    customer_weights = np.random.pareto(a=2.0, size=len(db_customers)) + 0.1
    customer_weights /= customer_weights.sum()

    store_weights = [s.square_footage / 10000.0 for s in db_stores]
    store_weights_sum = sum(store_weights)
    store_weights = [w / store_weights_sum for w in store_weights]

    payment_methods = ["UPI / QR Code", "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery", "EMI / PayLater"]
    payment_weights = [0.48, 0.22, 0.15, 0.08, 0.05, 0.02]

    # Indian retail festive dates & anomaly multipliers
    ANOMALY_DATES = {
        # Diwali Festival Sale 2024 (Huge Spike +340%)
        datetime.date(2024, 11, 1): 4.2,
        datetime.date(2024, 11, 2): 3.9,
        # Big Billion / Festive Launch Oct 2024
        datetime.date(2024, 10, 12): 3.1,
        # Monsoon Logistics Slowdown July 2025 (Drop -60%)
        datetime.date(2025, 7, 24): 0.40,
        # Independence Day Mega Sale Aug 2025 (+260%)
        datetime.date(2025, 8, 15): 3.6,
        # Diwali Festival Sale 2025 (+360%)
        datetime.date(2025, 10, 20): 4.5,
        datetime.date(2025, 10, 21): 4.1,
        # Republic Day Super Sale Jan 2026 (+220%)
        datetime.date(2026, 1, 26): 3.2,
    }

    db_product_lookup = {p.id: p for p in db_products}
    prod_ids = list(db_product_lookup.keys())
    cust_ids = [c.id for c in db_customers]
    store_ids = [s.id for s in db_stores]

    order_batch = []
    order_counter = 1
    avg_daily_orders = int(target_transaction_count / max(1, total_days))
    batch_insert_size = 5000

    for day_idx in range(total_days):
        day_date = start_date.date() + timedelta(days=day_idx)
        month = day_date.month
        weekday = day_date.weekday()

        # Seasonal curves: Q4 Festive season (Oct, Nov, Dec), Wedding season (Jan, Feb, May)
        seasonal_factor = 1.0
        if month in [10, 11]:
            seasonal_factor = 1.70  # Diwali / Festive Peak
        elif month in [12, 1]:
            seasonal_factor = 1.30  # Year End / New Year / Wedding
        elif month in [8, 9]:
            seasonal_factor = 1.20  # Onam / Raksha Bandhan / Ganesh Chaturthi
        elif month in [6, 7]:
            seasonal_factor = 0.90  # Monsoon lull

        dow_factor = 1.35 if weekday in [4, 5, 6] else 0.85
        year_factor = 1.0 + (day_date.year - 2024) * 0.15
        anomaly_mult = ANOMALY_DATES.get(day_date, 1.0)

        daily_order_count = int(avg_daily_orders * seasonal_factor * dow_factor * year_factor * anomaly_mult * random.uniform(0.9, 1.1))
        daily_order_count = max(15, daily_order_count)

        sampled_custs = np.random.choice(cust_ids, size=daily_order_count, p=customer_weights)
        sampled_stores = np.random.choice(store_ids, size=daily_order_count, p=store_weights)

        for i in range(daily_order_count):
            order_time = datetime.datetime.combine(
                day_date,
                datetime.time(
                    hour=random.randint(9, 22),
                    minute=random.randint(0, 59),
                    second=random.randint(0, 59)
                )
            )
            order_num = f"ORD-{day_date.year}-{order_counter:07d}"
            order_counter += 1

            c_id = int(sampled_custs[i])
            s_id = int(sampled_stores[i])
            pay_method = random.choices(payment_methods, weights=payment_weights)[0]

            num_items = random.choices([1, 2, 3, 4], weights=[0.52, 0.32, 0.11, 0.05])[0]
            chosen_prods = random.sample(prod_ids, k=num_items)

            total_amount = 0.0
            total_cost = 0.0
            total_profit = 0.0
            items_for_order = []

            for p_id in chosen_prods:
                p = db_product_lookup[p_id]
                qty = random.choices([1, 2, 3, 5], weights=[0.78, 0.15, 0.05, 0.02])[0]
                disc_pct = random.choices([0.0, 0.05, 0.10, 0.15, 0.20], weights=[0.65, 0.15, 0.12, 0.05, 0.03])[0]

                item_subtotal = round(qty * p.unit_price * (1 - disc_pct), 2)
                item_cost = round(qty * p.unit_cost, 2)
                item_profit = round(item_subtotal - item_cost, 2)

                total_amount += item_subtotal
                total_cost += item_cost
                total_profit += item_profit

                items_for_order.append({
                    "product_id": p_id,
                    "quantity": qty,
                    "unit_cost": p.unit_cost,
                    "unit_price": p.unit_price,
                    "discount_pct": disc_pct,
                    "subtotal": item_subtotal,
                    "profit": item_profit,
                    "created_at": order_time
                })

            status = "Completed"
            if random.random() < 0.02:
                status = "Cancelled"
            elif random.random() < 0.015:
                status = "Returned"

            order_batch.append({
                "order_data": Order(
                    order_number=order_num,
                    customer_id=c_id,
                    store_id=s_id,
                    order_date=order_time,
                    status=status,
                    payment_method=pay_method,
                    discount_amount=0.0,
                    tax_amount=round(total_amount * 0.18, 2),  # 18% GST standard
                    total_amount=round(total_amount, 2),
                    total_cost=round(total_cost, 2),
                    total_profit=round(total_profit, 2),
                    created_at=order_time
                ),
                "items": items_for_order
            })

            if len(order_batch) >= batch_insert_size:
                _flush_order_batch(db, order_batch)
                order_batch = []
                print(f"Seeded {order_counter - 1} Indian retail transactions...")

    if order_batch:
        _flush_order_batch(db, order_batch)
        print(f"Seeded {order_counter - 1} total orders successfully!")

    log = ActivityLog(
        action="DATASET_SEED",
        entity_type="SYSTEM",
        entity_id="ALL",
        details=f"Successfully initialized {order_counter - 1} India retail transactions in INR ₹."
    )
    db.add(log)
    db.commit()
    print("Database seeding completed with flying colors!")

def _flush_order_batch(db: Session, order_batch):
    orders = [item["order_data"] for item in order_batch]
    db.bulk_save_objects(orders)
    db.flush()

    order_numbers = [o.order_number for o in orders]
    db_orders = db.query(Order.id, Order.order_number).filter(Order.order_number.in_(order_numbers)).all()
    ord_id_map = {o.order_number: o.id for o in db_orders}

    items_to_insert = []
    for item in order_batch:
        ord_num = item["order_data"].order_number
        ord_id = ord_id_map.get(ord_num)
        if ord_id:
            for it in item["items"]:
                items_to_insert.append(
                    OrderItem(
                        order_id=ord_id,
                        product_id=it["product_id"],
                        quantity=it["quantity"],
                        unit_cost=it["unit_cost"],
                        unit_price=it["unit_price"],
                        discount_pct=it["discount_pct"],
                        subtotal=it["subtotal"],
                        profit=it["profit"],
                        created_at=it["created_at"]
                    )
                )
    if items_to_insert:
        db.bulk_save_objects(items_to_insert)
    db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db, target_transaction_count=35000)
    finally:
        db.close()
