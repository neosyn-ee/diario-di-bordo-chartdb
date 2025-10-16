#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');

// Configurazione
program
    .name('save-chartdb')
    .description('Salva i dati di ChartDB direttamente nel filesystem')
    .version('1.0.0')
    .option(
        '-f, --file <path>',
        'Percorso del file di output',
        'chartdb-data.json'
    )
    .option('-d, --data <json>', 'Dati JSON come stringa')
    .option('-i, --input <file>', 'File di input con i dati JSON')
    .option('--pretty', 'Formatta il JSON con indentazione', true);

program.parse(process.argv);

const options = program.opts();

async function main() {
    try {
        let jsonData;

        // 1. Prova a leggere da --data
        if (options.data) {
            jsonData = JSON.parse(options.data);
            console.log(chalk.blue('📥 Dati ricevuti da command line'));
        }
        // 2. Prova a leggere da --input
        else if (options.input) {
            const inputPath = path.resolve(options.input);
            if (!fs.existsSync(inputPath)) {
                throw new Error(`File non trovato: ${inputPath}`);
            }
            const fileContent = fs.readFileSync(inputPath, 'utf-8');
            jsonData = JSON.parse(fileContent);
            console.log(chalk.blue(`📥 Dati letti da: ${inputPath}`));
        }
        // 3. Prova a leggere da stdin
        else if (!process.stdin.isTTY) {
            let stdinData = '';
            process.stdin.setEncoding('utf8');

            for await (const chunk of process.stdin) {
                stdinData += chunk;
            }

            if (stdinData.trim()) {
                jsonData = JSON.parse(stdinData);
                console.log(chalk.blue('📥 Dati ricevuti da stdin'));
            } else {
                throw new Error('Nessun dato ricevuto da stdin');
            }
        }
        // 4. Nessun dato trovato
        else {
            throw new Error(`
❌ Nessun dato fornito. Usa uno di questi metodi:

1. Da stdin:
   echo '{"diagrams":[]}' | node scripts/save-chartdb.js

2. Da command line:
   node scripts/save-chartdb.js --data '{"diagrams":[]}'

3. Da file:
   node scripts/save-chartdb.js --input dati.json

4. Interattivo (digita i dati e premi Ctrl+D):
   node scripts/save-chartdb.js
      `);
        }

        // Salva il file
        const outputPath = path.resolve(options.file);
        const outputData = options.pretty
            ? JSON.stringify(jsonData, null, 2)
            : JSON.stringify(jsonData);

        fs.writeFileSync(outputPath, outputData);

        // Statistiche
        const stats = {
            diagrammi: jsonData.length || 0,
            tabelle: jsonData.reduce(
                (acc, diagram) => acc + (diagram.tables?.length || 0),
                0
            ),
            relazioni: jsonData.reduce(
                (acc, diagram) => acc + (diagram.relationships?.length || 0),
                0
            ),
            dimensioni: Buffer.byteLength(outputData, 'utf-8'),
        };

        console.log(chalk.green('✅ File salvato con successo!'));
        console.log(chalk.cyan(`📁 Percorso: ${outputPath}`));
        console.log(chalk.cyan(`📊 Diagrammi: ${stats.diagrammi}`));
        console.log(chalk.cyan(`🗃️  Tabelle: ${stats.tabelle}`));
        console.log(chalk.cyan(`🔗 Relazioni: ${stats.relazioni}`));
        console.log(
            chalk.cyan(
                `📏 Dimensioni: ${(stats.dimensioni / 1024).toFixed(2)} KB`
            )
        );
    } catch (error) {
        console.error(chalk.red('❌ Errore:'), error.message);
        process.exit(1);
    }
}

main();
