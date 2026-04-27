// @/components/FormSelect.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

import { Check, ChevronDown } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * 选项类型
 */
export interface LSelectOption {
  value: string | number
  label: string
}

interface LSelectProps {
  id?: string
  label: string
  value: string | number | (string | number)[]
  options: LSelectOption[]
  onChange: (value: string | number | (string | number)[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  multiSelect?: boolean
}

export function LSelect({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "请选择",
  disabled,
  className,
  multiSelect = false,
}: LSelectProps) {
  const [open, setOpen] = React.useState(false)
  /**
   * ========================
   * 多选模式
   * ========================
   */
  if (multiSelect) {
    const values = Array.isArray(value) ? value : []
    const stringValues = values.map((v) => String(v))
    const toggle = (val: string) => {
      const exists = stringValues.includes(val)

      let newValues: string[]
      if (exists) {
        newValues = stringValues.filter((v) => v !== val)
      } else {
        newValues = [...stringValues, val]
      }
      const result = newValues.map((v) => {
        const opt = options.find((o) => String(o.value) === v)
        return opt ? opt.value : v
      })

      onChange(result)
    }

    const selectedOptions = options.filter((opt) =>
      stringValues.includes(String(opt.value))
    )

    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={id}>{label}</Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={<div className="cursor-pointer" />}
            nativeButton={false}
          >
            <Button
              id={id}
              disabled={disabled}
              variant="outline"
              className="w-full justify-between"
            >
              <div className="flex flex-wrap gap-1">
                {selectedOptions.length > 0 ? (
                  selectedOptions.map((opt) => (
                    <Badge key={opt.value} variant="secondary">
                      {opt.label}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>

              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-full p-0" align="start">
            <Command className="rounded-lg border shadow-md">
              <div className="flex items-center border-b px-3">
                <CommandInput
                  placeholder="搜索..."
                  className="h-10 border-0 focus-visible:ring-0"
                />
              </div>
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                无结果
              </CommandEmpty>

              <CommandGroup className="max-h-60 overflow-y-auto">
                {options.map((opt) => {
                  const checked = stringValues.includes(String(opt.value))

                  return (
                    <CommandItem
                      key={opt.value}
                      onSelect={() => toggle(String(opt.value))}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          checked ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1">{opt.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  /**
   * ========================
   * 单选模式（原 Select）
   * ========================
   */
  const normalizeValue = (val?: string | number): string | undefined => {
    if (val === undefined || val === null) return undefined
    return String(val)
  }

  const denormalizeValue = (val: string): string | number => {
    const option = options.find((opt) => String(opt.value) === val)
    return option ? option.value : val
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>

      <Select
        disabled={disabled}
        value={normalizeValue(value as string | number)}
        onValueChange={(val) => {
          onChange(denormalizeValue(val ?? ""))
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * 通用布尔型复选框组件 Props 类型
 * 专门处理表单中的 boolean 状态（启用/禁用、同意/不同意等）
 */
interface LCheckboxProps {
  /** 表单元素 ID，用于关联 Label 标签 */
  id?: string
  /** 复选框左侧/右侧显示的文字标题 */
  label: string
  /** 当前布尔值状态：true=选中，false=未选中 */
  checked: boolean
  /** 状态变化回调函数，返回最新的 boolean 值 */
  onChange: (checked: boolean) => void
  /** 是否禁用复选框 */
  disabled?: boolean
  /** 自定义外层容器样式 */
  className?: string
}
/**
 * 通用布尔型复选框组件
 * 功能：集成 Checkbox + Label，专门处理 boolean 类型表单字段
 * 适用场景：启用状态、是否默认、是否显示、同意协议等
 */
export function LCheckbox({
  id = "checkbox",
  label,
  checked,
  onChange,
  disabled,
  className,
}: LCheckboxProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* 复选框核心组件 */}
      <Checkbox
        id={id}
        disabled={disabled}
        checked={checked}
        onCheckedChange={(value) => onChange(!!value)}
      />

      {/* 关联的标签文字 */}
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
    </div>
  )
}
