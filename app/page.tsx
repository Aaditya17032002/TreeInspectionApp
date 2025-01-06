'use client'

import { InspectionList } from '../components/inspections/inspection-list'
import { TreeDeciduous } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <TreeDeciduous className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </span>
            Welcome to Tree Inspections
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track your tree inspections</p>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto">
        <InspectionList />
      </main>
    </div>
  )
}

