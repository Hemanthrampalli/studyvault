// This file creates ONE connection to Supabase
// We export it so every route file can use the same connection
// Instead of creating a new connection in every file

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()  // loads all values from .env file into process.env

const supabase = createClient(
  process.env.SUPABASE_URL,         // reads SUPABASE_URL from .env
  process.env.SUPABASE_SERVICE_KEY  // reads SUPABASE_SERVICE_KEY from .env
)

module.exports = supabase  // export so other files can import it