import { InspectionList } from '../components/inspections/inspection-list'
import { TreeDeciduous } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="pb-16 md:pb-0 bg-background">
      <header className="border-b p-4 bg-background sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <TreeDeciduous className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </span>
            Welcome to Tree Inspections
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track your tree inspections</p>
        </div>
      </header>
      
      <InspectionList />
    </main>
  )
}

