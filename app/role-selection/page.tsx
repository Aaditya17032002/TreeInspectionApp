'use client'

import { useRouter } from 'next/navigation'
import { motion } from "framer-motion"
import { Sparkles, ClipboardList, ShieldCheck } from 'lucide-react'
import { Button } from "../../components/ui/button"

export default function RoleSelectionPage() {
  const router = useRouter()

  const handleRoleSelect = (role: 'inspector' | 'admin') => {
    if (role === 'inspector') {
      router.push('/login')
    } else {
      router.push('/admin/login')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-12 right-12"
      >
        <Sparkles className="w-6 h-6 text-purple-400" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-24 left-12"
      >
        <Sparkles className="w-4 h-4 text-purple-400" />
      </motion.div>

      {/* Content */}
      <div className="w-full max-w-md space-y-6">
        <motion.h1
          className="text-2xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Choose your role below
        </motion.h1>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => handleRoleSelect('inspector')}
            className="w-full p-4 bg-purple-100 hover:bg-purple-200 rounded-2xl transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center group-hover:bg-purple-300 transition-colors">
                <ClipboardList className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold">Inspector</h2>
                <p className="text-sm text-muted-foreground">Conduct tree inspections</p>
              </div>
            </div>
          </button>

          <div className="text-center text-sm text-muted-foreground">or</div>

          <button
            onClick={() => handleRoleSelect('admin')}
            className="w-full p-4 bg-purple-100 hover:bg-purple-200 rounded-2xl transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center group-hover:bg-purple-300 transition-colors">
                <ShieldCheck className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold">Admin</h2>
                <p className="text-sm text-muted-foreground">Review and manage inspections</p>
              </div>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
        </motion.div>
      </div>
    </div>
  )
}

