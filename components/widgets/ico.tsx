import React, { useState, useRef } from "react"
import {
  LayoutDashboard,
  UserCog,
  Users,
  Shield,
  Menu,
  ChevronDown,
  Home,
  Settings,
  User,
  Lock,
  FileText,
  BarChart,
  PieChart,
  Calendar,
  Mail,
  MessageSquare,
  Bell,
  Search,
  Plus,
  Minus,
  Edit,
  Trash,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Download,
  Upload,
  Share2,
  Copy,
  ExternalLink,
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Heart,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Clock,
  MapPin,
  Phone,
  UserPlus,
  UserMinus,
  LogOut,
  LogIn,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  Sun,
  Moon,
  CloudLightning,
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Droplet,
  Leaf,
  Mountain,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

interface IconProps {
  name: string
  className?: string
}

interface IconSelectorProps {
  value: string
  onChange: (value: string) => void
}

// 图标映射
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  UserCog,
  Users,
  UserRole: Shield,
  Menu,
  Home,
  Settings,
  User,
  Lock,
  FileText,
  BarChart,
  PieChart,
  Calendar,
  Mail,
  MessageSquare,
  Bell,
  Search,
  Plus,
  Minus,
  Edit,
  Trash,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Download,
  Upload,
  Share2,
  Copy,
  ExternalLink,
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Heart,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Clock,
  MapPin,
  Phone,
  UserPlus,
  UserMinus,
  LogOut,
  LogIn,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  Sun,
  Moon,
  CloudLightning,
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Droplet,
  Leaf,
  Mountain,
}

// 根据图标名称获取图标组件
export const getIconComponent = (
  iconName: string
): React.ElementType | null => {
  return iconMap[iconName] || null
}

// 图标组件
export function Icon({ name, className = "h-4 w-4" }: IconProps) {
  const IconComponent = getIconComponent(name)
  if (!IconComponent) {
    return null
  }
  return React.createElement(IconComponent, { className })
}

// 图标选择器组件
export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [selectedIcon, setSelectedIcon] = useState(value)
  const closeRef = useRef<HTMLButtonElement>(null)

  const handleIconSelect = (iconKey: string) => {
    setSelectedIcon(iconKey)
    onChange(iconKey)
    closeRef.current?.click()
  }

  return (
    <Dialog>
      <DialogTrigger
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-dashed border-muted px-4 py-2 transition-all duration-200 hover:border-primary"
        aria-label={value ? `当前图标：${value}，点击更换` : "选择图标"}
      >
        {value ? (
          <div className="flex items-center gap-3">
            {getIconComponent(value) &&
              React.createElement(
                getIconComponent(value) as React.ElementType,
                {
                  className: "h-5 w-5 text-primary",
                }
              )}
            <span className="text-sm font-medium">{value}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">点击选择图标</span>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DialogTrigger>
      <DialogContent className="p-4 sm:max-w-md" showCloseButton={false}>
        <div className="grid grid-cols-6 gap-3">
          {Object.entries(iconMap).map(([iconKey, IconComponent]) => (
            <button
              key={iconKey}
              type="button"
              className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-all duration-200 ${
                selectedIcon === iconKey
                  ? "scale-105 transform bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-muted hover:shadow-sm"
              }`}
              onClick={() => handleIconSelect(iconKey)}
              aria-label={`选择${iconKey}图标`}
              title={iconKey}
            >
              <IconComponent className="h-5 w-5" />
              <span className="w-full truncate text-center text-xs font-medium">
                {iconKey}
              </span>
            </button>
          ))}
        </div>
        <DialogClose ref={closeRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
