import { useCallback } from 'react';
import { useStorage } from './use-storage';

export const useChartExport = () => {
    const { listDiagrams } = useStorage();

    const exportAllCharts = useCallback(async () => {
        try {
            const diagrams = await listDiagrams({
                includeTables: true,
                includeRelationships: true,
                includeDependencies: true,
                includeAreas: true,
                includeCustomTypes: true,
            });

            if (window.showSaveFilePicker) {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'charts-export.json',
                    types: [
                        {
                            description: 'JSON Files',
                            accept: { 'application/json': ['.json'] },
                        },
                    ],
                });

                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(diagrams, null, 2));
                await writable.close();
                return true;
            }
        } catch (err) {
            console.warn('Errore export manuale', err);
            return false;
        }
    }, [listDiagrams]);

    return { exportAllCharts };
};
