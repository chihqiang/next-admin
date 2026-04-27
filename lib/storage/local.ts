import { IStorage } from "."

/**
 * localStorage 实现类
 * 实现 IStorage 接口，采用单例模式确保全局唯一
 */
class Local implements IStorage {
  /**
   * 单例实例（静态私有，保证唯一）
   */
  private static instance: Local

  /**
   * 私有构造函数
   * 禁止外部 new 创建实例，保证单例
   */
  private constructor() {}

  /**
   * 获取单例实例的静态方法
   * @returns Local 唯一实例
   */
  public static getInstance(): Local {
    if (!Local.instance) {
      Local.instance = new Local()
    }
    return Local.instance
  }

  /**
   * 实现存储方法
   * 自动 JSON 序列化，异常捕获防止程序崩溃
   */
  public set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error(`[local] set error: ${key}`, err)
    }
  }

  /**
   * 实现获取方法
   * 自动 JSON 反序列化，异常时返回默认值
   */
  public get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key)
      // 无数据时直接返回默认值
      if (data === null) return defaultValue
      return JSON.parse(data) as T
    } catch (err) {
      console.error(`[local] get error: ${key}`, err)
      return defaultValue
    }
  }

  /**
   * 实现删除指定数据
   */
  public remove(key: string): void {
    localStorage.removeItem(key)
  }

  /**
   * 实现清空所有数据
   */
  public clear(): void {
    localStorage.clear()
  }

  /**
   * 实现判断键是否存在
   */
  public has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }

  /**
   * 实现获取所有键名
   */
  public keys(): string[] {
    return Object.keys(localStorage)
  }

  /**
   * 实现获取存储总数
   */
  public size(): number {
    return localStorage.length
  }
}

/**
 * 创建并导出唯一的本地存储实例
 * 全局使用这一个实例即可
 */
export const local = Local.getInstance()
