'use client'

import { useRouter } from 'next/navigation'
import { Button } from "../../components/ui/button"
import { motion } from "framer-motion"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Decorative shapes */}
      <motion.div
        className="absolute top-0 left-0 w-48 h-48 bg-purple-500/20 rounded-br-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.div
        className="absolute bottom-20 right-0 w-32 h-32 bg-purple-500/20 rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
      <motion.div
        className="absolute top-40 right-8 w-16 h-16 bg-green-400/20 rounded-tl-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
      <motion.div
        className="absolute bottom-40 left-8 w-24 h-24 bg-pink-500/20 rounded-tr-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4">Tree</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          Streamline Tree Inspections for Efficient Urban Forest Management
        </p>
        <Button
          className="w-full max-w-xs bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => router.push('/role-selection')}
        >
          Next →
        </Button>
      </motion.div>
    </div>
  )
}

