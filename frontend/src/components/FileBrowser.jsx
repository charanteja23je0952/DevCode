import { useState, useEffect } from 'react';
import { EMOJIS } from '../constants/emojis';

export default function FileBrowser({ webcontainer, onFileSelect, selectedFile }) {
  const [files, setFiles] = useState([]);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (webcontainer) {
      loadFileSystem();
    }
  }, [webcontainer]);

  const loadFileSystem = async () => {
    if (!webcontainer) return;
    
    setLoading(true);
    try {
      const fileTree = await buildFileTree('/');
      setFiles(fileTree);
    } catch (err) {
      console.error('Failed to load file system:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildFileTree = async (dirPath) => {
    const entries = await webcontainer.fs.readdir(dirPath, { withFileTypes: true });
    const directories = [];
    const files = [];

    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
        continue;
      }
      const fullPath = dirPath === '/' ? `/${entry.name}` : `${dirPath}/${entry.name}`;

      if (entry.isDirectory()) {
        const children = await buildFileTree(fullPath);
        directories.push({
          name: entry.name,
          path: fullPath,
          type: 'directory',
          children,
          isExpanded: expandedDirs.has(fullPath),
        });
      } else {
        files.push({
          name: entry.name,
          path: fullPath,
          type: 'file',
          isExpanded: false,
        });
      }
    }

    directories.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    return [...directories, ...files];
  };

  const toggleDirectory = (path) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });

    const updateExpansion = (items) => {
      return items.map(item => {
        if (item.type === 'directory' && item.path === path) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children) {
          return { ...item, children: updateExpansion(item.children) };
        }
        return item;
      });
    };
    
    setFiles(updateExpansion(files));
  };

  const handleFileClick = (file) => {
    if (file.type === 'file') {
      onFileSelect(file);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
        return EMOJIS.JAVASCRIPT;
      case 'ts':
        return EMOJIS.TYPESCRIPT;
      case 'jsx':
      case 'tsx':
        return EMOJIS.REACT;
      case 'json':
        return EMOJIS.JSON;
      case 'css':
        return EMOJIS.CSS;
      case 'html':
        return EMOJIS.HTML;
      case 'md':
        return EMOJIS.MARKDOWN;
      case 'env':
        return EMOJIS.ENV;
      default:
        return EMOJIS.FILE;
    }
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item, index) => {
      const isSelected = selectedFile?.path === item.path;
      const paddingLeft = `${level * 16 + 8}px`;
      
      if (item.type === 'directory') {
        return (
          <div key={`${item.path}-${index}`}>
            <div
              className={`flex items-center py-1 px-2 cursor-pointer hover:bg-app-hover overflow-hidden ${
                isSelected ? 'bg-app-selected' : ''
              }`}
              style={{ paddingLeft }}
              onClick={() => toggleDirectory(item.path)}
            >
              <span className="mr-2 flex-shrink-0 text-sm text-blue-400">
                {item.isExpanded ? EMOJIS.FOLDER_OPEN : EMOJIS.FOLDER_CLOSED}
              </span>
              <span className="text-sm text-app-text truncate">{item.name}</span>
            </div>
            {item.isExpanded && item.children && (
              <div>{renderFileTree(item.children, level + 1)}</div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={`${item.path}-${index}`}
            className={`flex items-center py-1 px-2 cursor-pointer hover:bg-app-hover overflow-hidden ${
              isSelected ? 'bg-app-selected' : ''
            }`}
            style={{ paddingLeft }}
            onClick={() => handleFileClick(item)}
          >
            <span className="mr-2 flex-shrink-0 text-sm">{getFileIcon(item.name)}</span>
            <span className="text-sm text-app-text truncate">{item.name}</span>
          </div>
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-app-muted">Loading file system...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-app-border bg-app-hover flex-shrink-0">
        <h3 className="font-semibold text-app-text text-sm">File Browser</h3>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {files.length > 0 ? (
          renderFileTree(files)
        ) : (
          <div className="text-center text-app-muted text-sm py-4">
            No files loaded. Boot the environment first.
          </div>
        )}
      </div>
    </div>
  );
}