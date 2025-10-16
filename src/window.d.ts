declare global {
    interface Window {
        env?: Record<string, string>;

        // File System Access API
        showSaveFilePicker?: (options?: {
            suggestedName?: string;
            types?: Array<{
                description: string;
                accept: Record<string, string[]>;
            }>;
        }) => Promise<FileSystemFileHandle>;
    }
}

interface FileSystemFileHandle {
    createWritable: () => Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
    write: (
        data: string | Blob | ArrayBuffer | ArrayBufferView
    ) => Promise<void>;
    close: () => Promise<void>;
}

export {};
