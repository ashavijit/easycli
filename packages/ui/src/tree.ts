import { colors } from "./colors.js";

/**
 * Tree node definition.
 */
export interface TreeNode {
  /** Node name/label */
  name: string;
  /** Child nodes */
  children?: TreeNode[];
  /** Node icon (optional) */
  icon?: string;
  /** Node color */
  color?: "green" | "red" | "yellow" | "cyan" | "blue" | "magenta";
  /** Is this node expanded (for interactive trees) */
  expanded?: boolean;
}

/**
 * Tree options.
 */
export interface TreeOptions {
  /** Root node prefix */
  rootPrefix?: string;
  /** Show icons */
  showIcons?: boolean;
  /** Custom icons for files/folders */
  icons?: {
    folder?: string;
    file?: string;
    folderOpen?: string;
  };
  /** Indent width */
  indent?: number;
}

/**
 * Default icons for tree nodes.
 */
const DEFAULT_ICONS = {
  folder: "+",
  folderOpen: "-",
  file: " "
};

/**
 * Creates a tree view visualization.
 *
 * @param root - Root tree node.
 * @param options - Tree options.
 * @returns Formatted tree string.
 *
 * @example
 * ```ts
 * console.log(tree({
 *   name: "project",
 *   children: [
 *     { name: "src", children: [
 *       { name: "index.ts" },
 *       { name: "utils.ts" }
 *     ]},
 *     { name: "package.json" }
 *   ]
 * }));
 * ```
 */
export function tree(root: TreeNode, options: TreeOptions = {}): string {
  const {
    showIcons = true,
    icons = DEFAULT_ICONS
  } = options;

  const lines: string[] = [];

  function renderNode(node: TreeNode, prefix: string, isLast: boolean, isRoot: boolean): void {
    const hasChildren = node.children && node.children.length > 0;

    let connector = "";
    if (!isRoot) {
      connector = isLast ? "\u2514\u2500 " : "\u251C\u2500 ";
    }

    let icon = "";
    if (showIcons) {
      if (hasChildren) {
        icon = (node.expanded !== false ? icons.folderOpen : icons.folder) + " ";
      } else {
        icon = icons.file + " ";
      }
    }

    let name = node.name;
    if (node.color) {
      name = colors[node.color](name);
    } else if (hasChildren) {
      name = colors.cyan(name);
    }

    if (node.icon) {
      icon = node.icon + " ";
    }

    lines.push(`${prefix}${connector}${icon}${name}${hasChildren ? "/" : ""}`);

    if (node.children) {
      const childPrefix = isRoot ? "" : prefix + (isLast ? "   " : "\u2502  ");

      node.children.forEach((child, index) => {
        const childIsLast = index === node.children!.length - 1;
        renderNode(child, childPrefix, childIsLast, false);
      });
    }
  }

  renderNode(root, "", true, true);

  return lines.join("\n");
}

/**
 * Creates a tree from a file path array.
 *
 * @param paths - Array of file paths.
 * @returns Tree node structure.
 */
export function pathsToTree(paths: string[], rootName: string = "."): TreeNode {
  const root: TreeNode = { name: rootName, children: [] };

  for (const path of paths) {
    const parts = path.split(/[/\\]/);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isFile = i === parts.length - 1;

      let child = current.children?.find((c) => c.name === part);

      if (!child) {
        child = { name: part };
        if (!isFile) {
          child.children = [];
        }
        current.children = current.children ?? [];
        current.children.push(child);
      }

      current = child;
    }
  }

  return root;
}

/**
 * Creates a flat tree listing.
 *
 * @param paths - Array of paths.
 * @param showSize - Show file sizes (optional).
 * @returns Formatted listing.
 */
export function listing(
  items: Array<{ path: string; size?: string; modified?: string }>,
  options: { showSize?: boolean; showModified?: boolean } = {}
): string {
  const { showSize = false, showModified = false } = options;
  const maxPathLen = Math.max(...items.map((i) => i.path.length));

  const lines = items.map((item) => {
    let line = colors.cyan(item.path.padEnd(maxPathLen + 2));

    if (showSize && item.size) {
      line += colors.dim(item.size.padEnd(10));
    }

    if (showModified && item.modified) {
      line += colors.dim(item.modified);
    }

    return line;
  });

  return lines.join("\n");
}
