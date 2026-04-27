/**
 * 存储操作接口定义
 * 定义本地存储必须实现的标准方法，用于约束类的行为
 */
export interface IStorage {
  /**
   * 存储数据
   * @param key 存储的键名
   * @param value 存储的值（任意可序列化类型）
   */
  set<T>(key: string, value: T): void

  /**
   * 获取数据
   * @param key 存储的键名
   * @param defaultValue 取不到数据/解析失败时返回的默认值
   * @returns 对应类型的数据
   */
  get<T>(key: string, defaultValue: T): T

  /**
   * 删除指定键的数据
   * @param key 要删除的键名
   */
  remove(key: string): void

  /**
   * 清空所有 localStorage 数据
   */
  clear(): void

  /**
   * 判断某个键是否存在
   * @param key 键名
   * @returns 存在返回 true，不存在返回 false
   */
  has(key: string): boolean

  /**
   * 获取所有存储的键名数组
   * @returns 所有键名
   */
  keys(): string[]

  /**
   * 获取当前存储的数据总数
   * @returns 数量
   */
  size(): number
}

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

export { local } from "@/lib/storage/local"
