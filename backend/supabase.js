const { createClient } = require('@supabase/supabase-js')
const path = require('path')

require('dotenv').config({
  path: path.join(__dirname, '.env'),
})

const supabaseUrl = process.env.SUPABASE_URL?.trim()
const supabaseServiceKey = (
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim()

const missingEnv = []
if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) missingEnv.push('SUPABASE_URL')
if (!supabaseServiceKey || supabaseServiceKey.includes('your-service-role-key')) {
  missingEnv.push('SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY')
}

if (missingEnv.length > 0) {
  throw new Error(
    `Missing Supabase environment value(s): ${missingEnv.join(', ')}. ` +
      'Create backend/.env from backend/.env.example and restart the backend.',
  )
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

module.exports = supabase
