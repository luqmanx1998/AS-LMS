/* eslint-disable no-undef */
import { createClient } from '@supabase/supabase-js'

// ✅ Create secure Supabase client using the service key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,          // can be public
  process.env.SUPABASE_SERVICE_ROLE_KEY   // secret key — private
)

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // If sending JSON body
    const { id } = req.body || {}

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // ✅ Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) throw error

    console.log(`✅ Successfully deleted user ${id}`)
    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('❌ Error deleting user:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
