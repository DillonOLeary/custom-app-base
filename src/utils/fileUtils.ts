import { FileUpload, Folder, RedFlag } from '@/types/project';

// Convert a flat list of files with paths into a hierarchical folder structure
export function organizeFilesIntoFolders(files: FileUpload[]): { folders: Folder[], rootFiles: FileUpload[] } {
  // First separate files with and without paths
  const filesWithPath = files.filter(file => file.path);
  const rootFiles = files.filter(file => !file.path);
  
  // Create a map to store folders
  const folderMap: Record<string, Folder> = {};
  
  // For each file with a path, make sure all its parent folders exist
  filesWithPath.forEach(file => {
    const path = file.path || '';
    const pathParts = path.split('/').filter(part => part);
    
    // Create folders for each part of the path
    let currentPath = '';
    pathParts.forEach((part, index) => {
      // Build the path up to this folder
      const isLastPart = index === pathParts.length - 1;
      
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      // Create the folder if it doesn't exist
      if (!folderMap[currentPath]) {
        folderMap[currentPath] = {
          id: currentPath,
          name: part,
          path: currentPath,
          files: [],
          subfolders: [],
          isExpanded: false
        };
      }
      
      // If this is the last part, add the file to this folder
      if (isLastPart) {
        folderMap[currentPath].files.push(file);
      }
    });
  });
  
  // Now connect subfolders to their parents
  Object.values(folderMap).forEach(folder => {
    const pathParts = folder.path.split('/');
    if (pathParts.length > 1) {
      // Remove the last part to get the parent path
      pathParts.pop();
      const parentPath = pathParts.join('/');
      
      if (folderMap[parentPath]) {
        folderMap[parentPath].subfolders.push(folder);
      }
    }
  });
  
  // Get only root folders (those without parents)
  const rootFolders = Object.values(folderMap).filter(folder => {
    const pathParts = folder.path.split('/');
    return pathParts.length === 1;
  });
  
  return { folders: rootFolders, rootFiles };
}

// Link red flags to files based on related file IDs
export function connectRedFlagsToFiles(files: FileUpload[], redFlags: RedFlag[]): FileUpload[] {
  return files.map(file => {
    // Find all red flags related to this file
    const relatedFlagIds = redFlags
      .filter(flag => flag.relatedFiles?.includes(file.id))
      .map(flag => flag.id);
    
    // Return updated file with related flag IDs
    return {
      ...file,
      relatedRedFlags: relatedFlagIds,
      isHighlighted: relatedFlagIds.length > 0
    };
  });
}

// Add missing recommended files to folders
export function addMissingFilesToFolders(folders: Folder[], redFlags: RedFlag[]): Folder[] {
  // Create map of folder paths to folders
  const folderMap: Record<string, Folder> = {};
  
  // Helper function to recursively add all folders to the map
  const mapFolders = (folderList: Folder[]) => {
    folderList.forEach(folder => {
      folderMap[folder.path] = folder;
      mapFolders(folder.subfolders);
    });
  };
  
  mapFolders(folders);
  
  // Go through red flags and find missing files
  redFlags.forEach(flag => {
    if (flag.missingFiles?.length) {
      flag.missingFiles.forEach(missingFile => {
        // Extract folder path and file name from missing file
        // Format: "path/to/folder/filename.ext"
        const lastSlashIndex = missingFile.lastIndexOf('/');
        if (lastSlashIndex >= 0) {
          const folderPath = missingFile.substring(0, lastSlashIndex);
          const fileName = missingFile.substring(lastSlashIndex + 1);
          
          // Find the folder and add the missing file
          if (folderMap[folderPath]) {
            if (!folderMap[folderPath].missingRecommendedFiles) {
              folderMap[folderPath].missingRecommendedFiles = [];
            }
            folderMap[folderPath].missingRecommendedFiles.push(fileName);
          }
        }
      });
    }
  });
  
  return folders;
}

// Initialize standard folder structure with common categories for renewable energy projects
export function initializeStandardFolders(): Folder[] {
  const standardCategories = [
    {
      name: 'LLC',
      subfolders: ['Organization', 'Certificates', 'Operating Agreements']
    },
    {
      name: 'Site Control',
      subfolders: ['Leases', 'Easements', 'Title', 'Survey']
    },
    {
      name: 'Design',
      subfolders: ['PVSyst', 'Layout', 'Equipment', 'Civil']
    },
    {
      name: 'Interconnection',
      subfolders: ['Studies', 'Agreements', 'One Line']
    },
    {
      name: 'Environmental',
      subfolders: ['Reports', 'Permits', 'Phase I', 'Wetlands']
    },
    {
      name: 'Financial',
      subfolders: ['Models', 'Tax Equity', 'Offtake']
    },
    {
      name: 'Permits',
      subfolders: ['Local', 'State', 'Federal']
    },
    {
      name: 'Reports',
      subfolders: ['Geotechnical', 'Hydrology', 'Wildlife']
    }
  ];
  
  return standardCategories.map(category => {
    const id = category.name.toLowerCase().replace(/\s+/g, '-');
    const folder: Folder = {
      id,
      name: category.name,
      path: category.name,
      files: [],
      subfolders: category.subfolders.map(sub => ({
        id: `${id}-${sub.toLowerCase().replace(/\s+/g, '-')}`,
        name: sub,
        path: `${category.name}/${sub}`,
        files: [],
        subfolders: []
      })),
      isExpanded: false
    };
    
    return folder;
  });
}

// Add caching for better performance and stability
const fileProcessingCache = new Map<string, {
  folders: Folder[];
  rootFiles: FileUpload[];
  processedFiles: FileUpload[];
}>();

// Process files and organize them into standard folder structure
export function processFilesForProject(files: FileUpload[], redFlags?: RedFlag[]): {
  folders: Folder[];
  rootFiles: FileUpload[];
  processedFiles: FileUpload[];
} {
  try {
    // Create a cache key based on the files and redFlags
    const cacheKey = JSON.stringify({
      files: files.map(f => f.id),
      redFlags: redFlags?.map(rf => rf.id)
    });
    
    // Check if we have a cached result
    if (fileProcessingCache.has(cacheKey)) {
      return fileProcessingCache.get(cacheKey)!;
    }
    
    // Process the files if not cached
    let processedFiles = [...files];
    
    // Connect red flags to files if provided
    if (redFlags?.length) {
      processedFiles = connectRedFlagsToFiles(processedFiles, redFlags);
    }
    
    // Organize files into folders
    const { folders, rootFiles } = organizeFilesIntoFolders(processedFiles);
    
    // If no folders were created from file paths, initialize standard structure
    const finalFolders = folders.length > 0 ? folders : initializeStandardFolders();
    
    // Add missing files to folders if red flags are provided
    if (redFlags?.length) {
      addMissingFilesToFolders(finalFolders, redFlags);
    }
    
    // Cache the result
    const result = { folders: finalFolders, rootFiles, processedFiles };
    fileProcessingCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error in processFilesForProject:', error);
    // Return safe defaults if processing fails
    return { 
      folders: [], 
      rootFiles: files, 
      processedFiles: files 
    };
  }
}