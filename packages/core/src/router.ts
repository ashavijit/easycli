import type { CommandDef, TrieNode, CommandsSchema } from "./types.js";

export function createTrie(): TrieNode {
  return {
    children: new Map(),
    aliases: new Map()
  };
}

export function insertCommand(
  root: TrieNode,
  path: string[],
  command: CommandDef
): void {
  let node = root;
  for (const segment of path) {
    let child = node.children.get(segment);
    if (!child) {
      child = createTrie();
      node.children.set(segment, child);
    }
    node = child;
  }
  node.command = command;

  if (command.alias) {
    const aliases = Array.isArray(command.alias)
      ? command.alias
      : [command.alias];
    const parent = path.length > 1 ? findNode(root, path.slice(0, -1)) : root;
    if (parent) {
      const lastSegment = path[path.length - 1];
      if (lastSegment) {
        for (const alias of aliases) {
          parent.aliases.set(alias, lastSegment);
        }
      }
    }
  }

  if (command.commands) {
    for (const [name, subCommand] of Object.entries(command.commands)) {
      insertCommand(root, [...path, name], subCommand);
    }
  }
}

export function findNode(root: TrieNode, path: string[]): TrieNode | null {
  let node: TrieNode | undefined = root;
  for (const segment of path) {
    if (!node) return null;
    const resolved = node.aliases.get(segment) ?? segment;
    node = node.children.get(resolved);
  }
  return node ?? null;
}

export function findCommand(
  root: TrieNode,
  path: string[]
): { command: CommandDef | null; matchedPath: string[]; remaining: string[] } {
  let node: TrieNode | undefined = root;
  let lastCommand: CommandDef | null = null;
  let lastMatchIndex = 0;

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    if (!node || !segment) break;

    const resolved = node.aliases.get(segment) ?? segment;
    const child = node.children.get(resolved);

    if (!child) break;

    node = child;
    if (node.command) {
      lastCommand = node.command;
      lastMatchIndex = i + 1;
    }
  }

  return {
    command: lastCommand,
    matchedPath: path.slice(0, lastMatchIndex),
    remaining: path.slice(lastMatchIndex)
  };
}

export function buildRouter(commands: CommandsSchema): TrieNode {
  const root = createTrie();
  for (const [name, command] of Object.entries(commands)) {
    insertCommand(root, [name], command);
  }
  return root;
}
