import React from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';
import { ALL_EXAMPLES } from '../lib/examples';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';

export function Editor() {
  const { inputText, setInputText } = useApp();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Load example text
  const loadExample = (exampleId: string) => {
    const example = ALL_EXAMPLES.find((ex) => ex.id === exampleId);
    if (example) {
      setInputText(example.text);
    }
  };

  // Clear input
  const clearInput = () => {
    setInputText('');
    textareaRef.current?.focus();
  };

  // Handle paste - default behavior is fine

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      setInputText(text);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const charCount = inputText.length;

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 border-b bg-muted/30 h-[60px]">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Input</Label>
        </div>
        <div className="flex items-center gap-2">
          {/* Example selector */}
          <Select onValueChange={loadExample}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue placeholder="Load example..." />
            </SelectTrigger>
            <SelectContent>
              {ALL_EXAMPLES.map((example) => (
                <SelectItem key={example.id} value={example.id}>
                  {example.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearInput}
            disabled={!inputText}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Text area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          placeholder="Paste or type your text here... Drag and drop is also supported."
          className="text-area"
        />
      </div>

      {/* Stats */}
      <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
        {charCount} characters
      </div>
    </div>
  );
}
