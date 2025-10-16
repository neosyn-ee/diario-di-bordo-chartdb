import { useCallback } from 'react';
import type Dexie from 'dexie';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBDependency } from '@/lib/domain/db-dependency';
import type { Area } from '@/lib/domain/area';
import type { DBCustomType } from '@/lib/domain/db-custom-type';
import type { DiagramFilter } from '@/lib/domain/diagram-filter/diagram-filter';
import type { ChartDBConfig } from '@/lib/domain';
import type { EntityTable } from 'dexie';

export interface ChartDBDexie extends Dexie {
    diagrams: EntityTable<Diagram, 'id'>;
    db_tables: EntityTable<
        DBTable & {
            diagramId: string;
        },
        'id'
    >;
    db_relationships: EntityTable<
        DBRelationship & {
            diagramId: string;
        },
        'id'
    >;
    db_dependencies: EntityTable<
        DBDependency & {
            diagramId: string;
        },
        'id'
    >;
    areas: EntityTable<
        Area & {
            diagramId: string;
        },
        'id'
    >;
    db_custom_types: EntityTable<
        DBCustomType & {
            diagramId: string;
        },
        'id'
    >;
    config: EntityTable<
        ChartDBConfig & {
            id: number;
        },
        'id'
    >;
    diagram_filters: EntityTable<
        DiagramFilter & {
            diagramId: string;
        },
        'diagramId'
    >;
}

export const useChartDBFileSync = (db: ChartDBDexie) => {
    const saveChartsToFile = useCallback(async () => {
        try {
            const diagrams = await db.diagrams.toArray();

            for (const diagram of diagrams) {
                diagram.tables = await db.db_tables
                    .where('diagramId')
                    .equals(diagram.id)
                    .toArray();
                diagram.relationships = await db.db_relationships
                    .where('diagramId')
                    .equals(diagram.id)
                    .toArray();
                diagram.dependencies = await db.db_dependencies
                    .where('diagramId')
                    .equals(diagram.id)
                    .toArray();
                diagram.areas = await db.areas
                    .where('diagramId')
                    .equals(diagram.id)
                    .toArray();
                diagram.customTypes = await db.db_custom_types
                    .where('diagramId')
                    .equals(diagram.id)
                    .toArray();
            }

            if (window.showSaveFilePicker) {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'charts.json',
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
            }
        } catch (err) {
            console.warn('Errore salvataggio file', err);
        }
    }, [db]);

    const wrapWithFileSave = useCallback(
        <Args extends unknown[], ReturnType>(
            fn: (...args: Args) => Promise<ReturnType>
        ): ((...args: Args) => Promise<ReturnType>) => {
            return async (...args: Args) => {
                const result = await fn(...args);
                await saveChartsToFile();
                return result;
            };
        },
        [saveChartsToFile]
    );

    return { saveChartsToFile, wrapWithFileSave };
};
