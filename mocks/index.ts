import { setupWorker } from "msw/browser"
import { accountHandlers } from "@/mocks/handlers/account"
import { menuHandlers } from "@/mocks/handlers/menu"
import { roleHandlers } from "@/mocks/handlers/role"

const handlers = [...accountHandlers, ...menuHandlers, ...roleHandlers]

async function startMocking() {
  if (typeof window === "undefined") return
  if (process.env.NODE_ENV !== "development") return
  try {
    const worker = setupWorker(...handlers)
    await worker.start({
      onUnhandledRequest: "bypass",
    })
    console.log("✅ MSW 启动成功")
  } catch (e) {
    console.error("MSW 启动失败", e)
  }
}
startMocking()
