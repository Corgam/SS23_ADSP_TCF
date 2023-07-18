export function hashObj(obj: { [key: string]: any } | string) {
  const objStr = typeof obj == 'string' ? obj : JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < objStr.length; i++) {
    let code = objStr.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
