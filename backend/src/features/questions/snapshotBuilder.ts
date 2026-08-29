import fs from "fs";
import path from "path";

type FSTree = Record<string, any>;
type SubmittedFile = { path: string; contents: string };

const SNAPSHOTS_ROOT = path.join(process.cwd(), "snapshots");

const SKIP_DIRS = new Set(["node_modules", "images", ".git"]);
const SKIP_EXTS = new Set([".png", ".jpg", ".jpeg", ".ico"]);
const SKIP_FILES = new Set([".DS_Store"]);

function buildFileSystemTree(dirPath: string): FSTree {
  const tree: FSTree = {};
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || SKIP_FILES.has(entry.name)) continue;

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      tree[entry.name] = { directory: buildFileSystemTree(fullPath) };
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (SKIP_EXTS.has(ext)) continue;
      tree[entry.name] = { file: { contents: fs.readFileSync(fullPath, "utf-8") } };
    }
  }
  return tree;
}


function applyOverlay(
  baseTree: FSTree,
  overlayDirPath: string,
  relPath: string[] = [],
  touchedPaths?: string[]
): void {
  if (!fs.existsSync(overlayDirPath)) return;

  for (const entry of fs.readdirSync(overlayDirPath, { withFileTypes: true })) {
    if (SKIP_FILES.has(entry.name)) continue;

    const fullPath = path.join(overlayDirPath, entry.name);
    const nextRelPath = [...relPath, entry.name];

    if (entry.isDirectory()) {
      applyOverlay(baseTree, fullPath, nextRelPath, touchedPaths);
      continue;
    }

    let node = baseTree;
    for (let i = 0; i < nextRelPath.length - 1; i++) {
      const segment = nextRelPath[i];
      if (!node[segment as string]) node[segment as string] = { directory: {} };
      node = node[segment as string].directory;
    }
    node[nextRelPath.at(-1) as string] = {
      file: { contents: fs.readFileSync(fullPath, "utf-8") },
    };

    if (touchedPaths && entry.name !== "challenge.md") {
      touchedPaths.push("/" + nextRelPath.join("/"));
    }
  }
}

export function getMergedSnapshot(
  baseRepoSlug: string,
  overlaySlug: string
): { tree: FSTree; overlayPaths: string[] } {
  const basePath = path.join(SNAPSHOTS_ROOT, "base", baseRepoSlug);
  const overlayPath = path.join(SNAPSHOTS_ROOT, "overlays", overlaySlug);
  const hiddenTestPath = path.join(SNAPSHOTS_ROOT, "hidden-tests", overlaySlug);

  if (!fs.existsSync(basePath)) {
    throw new Error(`Base repo not found: ${baseRepoSlug}`);
  }

  const tree = buildFileSystemTree(basePath);
  const overlayPaths: string[] = [];

  applyOverlay(tree, overlayPath, [], overlayPaths);
  applyOverlay(tree, hiddenTestPath);

  return { tree, overlayPaths };
}

export function getSubmissionSnapshot(
  baseRepoSlug: string,
  submittedFiles: SubmittedFile[],
  overlaySlug?: string,
  includeHiddenTests: boolean = false
): { tree: FSTree; overlayPaths: string[] } {
  if (!baseRepoSlug) {
    throw new Error('baseRepoSlug is required for submission snapshot');
  }

  const basePath = path.join(SNAPSHOTS_ROOT, "base", baseRepoSlug);

  if (!fs.existsSync(basePath)) {
    throw new Error(`Base repo not found: ${baseRepoSlug}`);
  }

  const tree = buildFileSystemTree(basePath);
  const overlayPaths: string[] = [];

  for (const file of submittedFiles) {
    const pathParts = file.path.split('/').filter((p): p is string => p.length > 0);
    let currentNode: any = tree;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (part && !currentNode[part]) {
        currentNode[part] = { directory: {} };
      }
      if (part && currentNode[part]) {
        currentNode = currentNode[part].directory;
      }
    }
    
    const fileName = pathParts[pathParts.length - 1];
    if (fileName) {
      currentNode[fileName] = { file: { contents: file.contents } };
      overlayPaths.push(file.path.startsWith('/') ? file.path : '/' + file.path);
    }
  }

  if (overlaySlug && includeHiddenTests) {
    const hiddenTestPath = path.join(SNAPSHOTS_ROOT, "hidden-tests", overlaySlug);
    applyOverlay(tree, hiddenTestPath);
  }

  return { tree, overlayPaths };
}