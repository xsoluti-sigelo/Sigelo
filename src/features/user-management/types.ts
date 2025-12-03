export interface UserListItem {
  id: string
  email: string
  full_name: string
  role: string
  active: boolean
  last_login_at: string | null
  created_at: string
  picture_url?: string
  is_invite?: boolean
  invite_status?: string
  invite_expires_at?: string
  invite_id?: string
}
