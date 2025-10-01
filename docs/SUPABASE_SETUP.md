# Supabase Configuration Setup

## 🚨 Action Required: Configure Your Supabase Credentials

Your ETL script needs Supabase credentials to connect to your database. Here's how to set them up:

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (the-hub-achievers)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (⚠️ Keep this secret!)

### Step 2: Create Environment Files

#### Option A: Create frontend/.env.local
```bash
# In your frontend/ directory, create .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### Option B: Create backend/.env
```bash
# In your backend/ directory, create .env:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Step 3: Run Your ETL Script

Once you've set up the environment variables, run:
```bash
python src/seed_supabase.py
```

## 🔍 What Your Script Found

Your Excel file has these columns (you may want to update the column mapping):
- Marca temporal
- Dirección de correo electrónico
- Nombre
- Apellido
- Numero de documento
- ¿Qué estudias o cuál es tu rol?
- ¿De dónde vienes?
- And many more...

The script successfully read 82 rows and is ready to load them into Supabase once you configure the credentials!
