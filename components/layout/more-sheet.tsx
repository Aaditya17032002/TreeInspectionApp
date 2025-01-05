import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../components/ui/sheet"
import { Bell, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

interface MoreSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogout: () => void
}

export function MoreSheet({ open, onOpenChange, onLogout }: MoreSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[300px]">
        <SheetHeader>
          <SheetTitle>More Options</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => {
              onLogout()
              onOpenChange(false)
            }}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

