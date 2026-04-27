"use client"

import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type FormField = {
  name: string
  label: string
  type?: string
  placeholder?: string
  maxLength?: number
  className?: string
  validate?: (
    value: string,
    allValues?: Record<string, string>
  ) => string | null
  formatter?: (value: string) => string
}

export type StepConfig = {
  title: string
  description: string
  fields: FormField[]
  actionText: string
  onSubmitAction?: (values: Record<string, string>) => Promise<boolean | void>
}

type MultiStepDialogProps = {
  className?: string
  triggerText: string
  steps: StepConfig[]
  onCompleteAction?: (finalValues: Record<string, string>) => Promise<void>
}

export function MultiStepDialog({
  className,
  triggerText,
  steps,
  onCompleteAction,
}: MultiStepDialogProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = async () => {
    const step = steps[currentStep]

    for (const field of step.fields) {
      const val = formValues[field.name] || ""
      if (field.validate) {
        // 🔥 修复：传入第二个参数 allValues
        const err = field.validate(val, formValues)
        if (err) {
          toast.error(err)
          return
        }
      }
    }

    setIsLoading(true)
    try {
      const success = await step.onSubmitAction?.(formValues)
      if (success === false) return

      if (currentStep === steps.length - 1) {
        await onCompleteAction?.(formValues)
        reset()
        return
      }

      setCurrentStep((prev) => prev + 1)
    } catch {
      toast.error("操作失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setOpen(false)
    setTimeout(() => {
      setCurrentStep(0)
      setFormValues({})
    }, 300)
  }

  const step = steps[currentStep]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "ml-auto text-sm underline-offset-4 hover:underline",
          className
        )}
      >
        {triggerText}
      </button>

      <Dialog open={open} onOpenChange={reset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{step.title}</DialogTitle>
            <DialogDescription>{step.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {step.fields.map((field) => (
              <div key={field.name} className="grid gap-3">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  value={formValues[field.name] || ""}
                  onChange={(e) => {
                    let val = e.target.value
                    if (field.formatter) val = field.formatter(val)
                    handleChange(field.name, val)
                  }}
                  className={field.className}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading ? "处理中..." : step.actionText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
