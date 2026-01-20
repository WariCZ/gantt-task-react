import type { Task } from "../types/public-types";

export const getAllParents = (tasks: Task[], childId: string): Task[] => {
  const byId = new Map(tasks.map(t => [t.id, t]));
  const children = new Map<string, Task[]>();

  // indexujeme děti podle parent id
  for (const t of tasks) {
    if (t.parent) {
      if (!children.has(t.parent)) children.set(t.parent, []);
      children.get(t.parent)!.push(t);
    }
  }

  // 🔼 najdeme všechny rodiče
  const parents: Task[] = [];
  let current = byId.get(childId);
  while (current && current.parent) {
    const parent = byId.get(current.parent);
    if (!parent) break;
    parents.push(parent);
    current = parent;
  }

  // 🔽 rekurzivně najdeme všechny potomky
  const descendants: Task[] = [];
  const collectChildren = (id: string) => {
    const subs = children.get(id);
    if (!subs) return;
    for (const c of subs) {
      descendants.push(c);
      collectChildren(c.id);
    }
  };

  for (const p of parents) {
    collectChildren(p.id);
  }

  // výsledek = původní child + parenti + jejich childi
  const result = new Map<string, Task>();
  const start = byId.get(childId);
  if (start) result.set(start.id, start);
  for (const p of parents) result.set(p.id, p);
  for (const c of descendants) result.set(c.id, c);

  return Array.from(result.values());
};
