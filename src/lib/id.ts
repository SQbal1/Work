/** Short, collision-resistant id for mock records. Swap for DB ids later. */
export function uid(prefix = ""): string {
  const time = Date.now().toString(36).slice(-4);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}${time}${rand}`;
}
