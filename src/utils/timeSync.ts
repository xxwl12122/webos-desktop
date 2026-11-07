// 联网高精度时钟同步模块 (Network Time Sync)

let serverTimeOffset: number | null = null;
let isSyncedWithNetwork = false;

// 异步校准网络时间
export async function syncNetworkTime(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    // 方案 1: 世界时钟公开 API
    const res = await fetch('https://worldtimeapi.org/api/ip', {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.unixtime) {
        const serverMs = data.unixtime * 1000;
        serverTimeOffset = serverMs - Date.now();
        isSyncedWithNetwork = true;
        return true;
      }
    }
  } catch (_) {
    clearTimeout(timeoutId);
  }

  // 方案 2 备选: HEAD 请求解析 HTTP Date 响应头
  try {
    const headRes = await fetch(window.location.href, {
      method: 'HEAD',
      cache: 'no-store',
    });
    const dateHeader = headRes.headers.get('date');
    if (dateHeader) {
      const serverMs = new Date(dateHeader).getTime();
      if (!isNaN(serverMs)) {
        serverTimeOffset = serverMs - Date.now();
        isSyncedWithNetwork = true;
        return true;
      }
    }
  } catch (_) {}

  return false;
}

// 获取校准后的精确日期对象（断网无感降级原生 Date）
export function getSyncedDate(): Date {
  if (serverTimeOffset !== null) {
    return new Date(Date.now() + serverTimeOffset);
  }
  return new Date();
}

export function isTimeNetworkSynced(): boolean {
  return isSyncedWithNetwork;
}
