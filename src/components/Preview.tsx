import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { useApp } from '../context/AppContext';

export function Preview() {
  const { outputText, settings, updateSetting } = useApp();

  // For reveal hyphens: replace soft hyphens with visible markers
  const displayText = React.useMemo(() => {
    if (!outputText) return '';

    if (settings.revealHyphens) {
      // Replace soft hyphens with visible marker
      if (settings.encoding === 'html') {
        return outputText.replace(/&shy;/g, '<mark style="background: #fbbf24; color: #000; padding: 0 2px; font-weight: bold;">-</mark>');
      } else {
        return outputText.replace(/\u00AD/g, '<mark style="background: #fbbf24; color: #000; padding: 0 2px; font-weight: bold;">-</mark>');
      }
    }

    return outputText;
  }, [outputText, settings.revealHyphens, settings.encoding]);

  // CSS styles for preview
  const previewStyles: React.CSSProperties = {
    hyphens: settings.previewHyphens,
    overflowWrap: settings.previewOverflowWrap,
    wordBreak: settings.previewWordBreak,
    lineHeight: '1.8',
    textAlign: 'justify',
  };

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 border-b bg-muted/30 h-[60px]">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Preview</Label>
        </div>

        <div className="flex items-center gap-2">
          {/* Reveal hyphens button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateSetting('revealHyphens', !settings.revealHyphens)}
            className="h-8"
          >
            {settings.revealHyphens ? (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Hide hyphens
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Show hyphens
              </>
            )}
          </Button>

          {/* CSS hyphens property */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select
                  value={settings.previewHyphens}
                  onValueChange={(value) =>
                    updateSetting('previewHyphens', value as 'auto' | 'manual')
                  }
                >
                  <SelectTrigger className="h-8 w-[110px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">CSS: auto</SelectItem>
                    <SelectItem value="manual">CSS: manual</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold mb-1">CSS hyphens property</p>
                <p className="text-xs"><strong>manual:</strong> Only break at soft hyphens you inserted</p>
                <p className="text-xs"><strong>auto:</strong> Browser adds additional breaks (requires lang attribute)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* overflow-wrap property */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select
                  value={settings.previewOverflowWrap}
                  onValueChange={(value) =>
                    updateSetting('previewOverflowWrap', value as 'normal' | 'anywhere')
                  }
                >
                  <SelectTrigger className="h-8 w-[110px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">wrap: normal</SelectItem>
                    <SelectItem value="anywhere">wrap: anywhere</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold mb-1">CSS overflow-wrap property</p>
                <p className="text-xs"><strong>normal:</strong> Only break at hyphens or whitespace</p>
                <p className="text-xs"><strong>anywhere:</strong> Break anywhere if word is too long (emergency breaks)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Preview container */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {outputText ? (
          <div
            className="p-4"
            style={previewStyles}
            dangerouslySetInnerHTML={{ __html: displayText }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Preview will appear here...
          </div>
        )}
      </div>

      {/* Bottom bar - matches Editor and Output */}
      <div className="px-4 py-2 border-t bg-muted/20 text-xs">
        {outputText ? (
          <div className="flex flex-col gap-0.5">
            <div className="text-muted-foreground">Live preview</div>
            <div className="text-muted-foreground/60">Adjust CSS controls to test rendering</div>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <div className="text-muted-foreground">Preview area</div>
            <div className="text-muted-foreground/60">Results will render here</div>
          </div>
        )}
      </div>
    </div>
  );
}
