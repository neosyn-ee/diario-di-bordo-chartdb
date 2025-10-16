import ChartDBDarkLogo from '@/assets/logo-dark.png';
import ChartDBLogo from '@/assets/logo-light.png';
import { useChartRepositorySync } from '@/hooks/use-chart-repository-sync';
import { useTheme } from '@/hooks/use-theme';
import { Download } from 'lucide-react'; // Importa un'icona
import React, { useCallback } from 'react';
import { DiagramName } from './diagram-name';
import { LanguageNav } from './language-nav/language-nav';
import { LastSaved } from './last-saved';
import { Menu } from './menu/menu';

export interface TopNavbarProps {}

export const TopNavbar: React.FC<TopNavbarProps> = () => {
    const { effectiveTheme } = useTheme();
    const { saveToRepository } = useChartRepositorySync(); // Usa l'hook

    const handleSaveToRepo = useCallback(async () => {
        await saveToRepository();
    }, [saveToRepository]);

    const renderStars = useCallback(() => {
        return (
            <iframe
                src={`https://ghbtns.com/github-btn.html?user=chartdb&repo=chartdb&type=star&size=large&text=false`}
                width="40"
                height="30"
                title="GitHub"
            ></iframe>
        );
    }, []);

    return (
        <nav className="flex flex-col justify-between border-b px-3 md:h-12 md:flex-row md:items-center md:px-4">
            <div className="flex flex-1 flex-col justify-between gap-x-1 md:flex-row md:justify-normal">
                <div className="flex items-center justify-between pt-[8px] font-primary md:py-[10px]">
                    <a
                        href="https://chartdb.io"
                        className="cursor-pointer"
                        rel="noreferrer"
                    >
                        <img
                            src={
                                effectiveTheme === 'light'
                                    ? ChartDBLogo
                                    : ChartDBDarkLogo
                            }
                            alt="chartDB"
                            className="h-4 max-w-fit"
                        />
                    </a>
                </div>
                <Menu />
            </div>
            <DiagramName />
            <div className="hidden flex-1 items-center justify-end gap-2 sm:flex">
                <button
                    onClick={handleSaveToRepo}
                    className="flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Salva dati nel repository (download file JSON)"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">Save to Repo</span>
                </button>

                <LastSaved />
                {renderStars()}
                <LanguageNav />
            </div>
        </nav>
    );
};
