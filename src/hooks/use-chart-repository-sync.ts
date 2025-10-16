import { useCallback } from 'react';
import { useStorage } from './use-storage';
import type { Diagram } from '@/lib/domain';

export const useChartRepositorySync = () => {
    const { listDiagrams } = useStorage();

    // Crea un file HTML che salva automaticamente
    const saveWithExecutable = async (diagrams: Diagram[]) => {
        const dataStr = JSON.stringify(diagrams, null, 2);

        // Crea un HTML che quando aperto salva il file
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>ChartDB Auto-Save</title>
    <script>
        function saveFile() {
            const data = ${JSON.stringify(dataStr)};
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chartdb-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            document.getElementById('message').innerHTML = 
                '✅ File salvato! Ora puoi chiudere questa pagina.<br>' +
                '📊 Diagrammi: ${diagrams.length}<br>' +
                '💡 Salva il file nella root del tuo progetto e fai git commit.';
        }
        
        window.onload = saveFile;
    </script>
</head>
<body>
    <div id="message" style="padding: 20px; font-family: Arial;">
        ⏳ Salvataggio in corso...
    </div>
</body>
</html>`;

        // Scarica l'HTML
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chartdb-auto-save.html';
        link.click();
        URL.revokeObjectURL(url);

        alert(
            `📁 File "chartdb-auto-save.html" scaricato!\n\nApri il file nel browser e il salvataggio partirà automaticamente.`
        );
    };

    const saveToRepository = useCallback(async () => {
        try {
            const diagrams = await listDiagrams({
                includeTables: true,
                includeRelationships: true,
                includeDependencies: true,
                includeAreas: true,
                includeCustomTypes: true,
            });

            // Tentativo di salvataggio automatico
            if (process.env.NODE_ENV === 'development') {
                try {
                    const response = await fetch('/api/auto-save-charts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(diagrams),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        alert(
                            `✅ Salvato automaticamente in: ${result.path}\n📊 Diagrammi: ${result.diagrams}`
                        );
                        return true;
                    }
                } catch (error) {
                    console.log(
                        'Salvataggio automatico fallito, usa metodo alternativo',
                        error
                    );
                }
            }

            // Metodo alternativo: Crea e scarica file eseguibile
            await saveWithExecutable(diagrams);
            return true;
        } catch (err) {
            console.error('Errore salvataggio:', err);
            alert('❌ Errore nel salvataggio');
            return false;
        }
    }, [listDiagrams]);

    const wrapWithFileSave = useCallback(
        <Args extends unknown[], ReturnType>(
            fn: (...args: Args) => Promise<ReturnType>
        ): ((...args: Args) => Promise<ReturnType>) => {
            return async (...args: Args) => {
                const result = await fn(...args);
                // await saveToRepository();
                return result;
            };
        },
        []
    );

    return { saveToRepository, wrapWithFileSave };
};
