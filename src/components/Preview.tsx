import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
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
    <div className="flex flex-col h-full bg-card border">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 border-b bg-muted/30 h-[60px]">
        <div className="flex items-center gap-3">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Preview</Label>

          {/* Reveal hyphens toggle - compact */}
          <div className="flex items-center gap-1.5 ml-2">
            <Switch
              id="reveal-hyphens"
              checked={settings.revealHyphens}
              onCheckedChange={(checked) => updateSetting('revealHyphens', checked)}
              className="scale-90"
            />
            <Label htmlFor="reveal-hyphens" className="text-xs cursor-pointer flex items-center gap-1">
              {settings.revealHyphens ? (
                <>
                  <Eye className="h-3 w-3" />
                  Hyphens visible
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  Hidden
                </>
              )}
            </Label>
          </div>
        </div>

        {/* CSS Controls - compact */}
        <div className="flex items-center gap-2 text-xs">
          {/* hyphens property */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-0.5">
                  <Label className="text-muted-foreground cursor-help text-[10px]">hyphens:</Label>
                  <Select
                    value={settings.previewHyphens}
                    onValueChange={(value) =>
                      updateSetting('previewHyphens', value as 'auto' | 'manual')
                    }
                  >
                    <SelectTrigger className="h-6 w-[70px] text-[10px] px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">auto</SelectItem>
                      <SelectItem value="manual">manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="flex items-center gap-0.5">
                  <Label className="text-muted-foreground cursor-help text-[10px]">overflow:</Label>
                  <Select
                    value={settings.previewOverflowWrap}
                    onValueChange={(value) =>
                      updateSetting('previewOverflowWrap', value as 'normal' | 'anywhere')
                    }
                  >
                    <SelectTrigger className="h-6 w-[80px] text-[10px] px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">normal</SelectItem>
                      <SelectItem value="anywhere">anywhere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
      <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
        {outputText ? 'Live preview with CSS controls' : 'Preview area'}
      </div>
    </div>
  );
}
