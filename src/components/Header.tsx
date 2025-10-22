import React from 'react';
import { Languages, FileType, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { useApp } from '../context/AppContext';
import { formatConfidence } from '../lib/langDetect';

export function Header() {
  const {
    settings,
    updateSetting,
    detectedLanguage,
    detectionConfidence,
    isProcessing,
  } = useApp();

  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Initialize theme from system preference
  React.useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = isDark ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  return (
    <header className="border-b bg-card px-2 sm:px-4 py-2 sm:py-3">
      <div className="container mx-auto">
        {/* Mobile: Stack Layout */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">SilentHyphen</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-8 w-8"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={settings.language}
              onValueChange={(value) =>
                updateSetting('language', value as 'auto' | 'de' | 'en')
              }
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="de">DE</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={settings.encoding}
              onValueChange={(value) =>
                updateSetting('encoding', value as 'html' | 'unicode')
              }
            >
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">&amp;shy;</SelectItem>
                <SelectItem value="unicode">U+00AD</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1.5">
              <Switch
                id="html-mode-mobile"
                checked={settings.htmlMode}
                onCheckedChange={(checked) => updateSetting('htmlMode', checked)}
                className="scale-75"
              />
              <Label htmlFor="html-mode-mobile" className="text-xs cursor-pointer flex items-center gap-1">
                <FileType className="h-3 w-3" />
                HTML
              </Label>
            </div>
          </div>
        </div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Languages className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">SilentHyphen</h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Language Selection */}
            <div className="flex items-center gap-2">
              <Label htmlFor="language" className="text-sm">
                Language:
              </Label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  updateSetting('language', value as 'auto' | 'de' | 'en')
                }
              >
                <SelectTrigger id="language" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    Auto-detect
                    {detectedLanguage && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({detectedLanguage.toUpperCase()}{' '}
                        {formatConfidence(detectionConfidence)})
                      </span>
                    )}
                  </SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Output Encoding */}
            <div className="flex items-center gap-2">
              <Label htmlFor="encoding" className="text-sm">
                Output:
              </Label>
              <Select
                value={settings.encoding}
                onValueChange={(value) =>
                  updateSetting('encoding', value as 'html' | 'unicode')
                }
              >
                <SelectTrigger id="encoding" className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">&amp;shy;</SelectItem>
                  <SelectItem value="unicode">U+00AD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* HTML Mode */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="html-mode"
                      checked={settings.htmlMode}
                      onCheckedChange={(checked) => updateSetting('htmlMode', checked)}
                    />
                    <Label htmlFor="html-mode" className="flex items-center gap-1 cursor-pointer">
                      <FileType className="h-4 w-4" />
                      HTML
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preserve HTML tags and entities</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Theme Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle dark mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Processing...
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
