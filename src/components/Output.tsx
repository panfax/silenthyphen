import React from 'react';
import { FileOutput, Copy, Download, CheckCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useApp } from '../context/AppContext';

export function Output() {
  const { outputText, stats } = useApp();
  const [copied, setCopied] = React.useState(false);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Download as .txt
  const downloadTxt = () => {
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hyphenated-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download as .html
  const downloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hyphenated Text</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    p {
      hyphens: manual;
      text-align: justify;
    }
  </style>
</head>
<body>
  ${outputText.split('\n\n').map(para => `<p>${para}</p>`).join('\n  ')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hyphenated-text.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FileOutput className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Output</Label>
        </div>
        <div className="flex items-center gap-2">
          {/* Copy button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            disabled={!outputText}
            className="h-8"
          >
            {copied ? (
              <>
                <CheckCheck className="h-4 w-4 mr-1 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>

          {/* Download .txt */}
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadTxt}
            disabled={!outputText}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-1" />
            .txt
          </Button>

          {/* Download .html */}
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadHtml}
            disabled={!outputText}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-1" />
            .html
          </Button>
        </div>
      </div>

      {/* Output text area */}
      <div className="flex-1 relative">
        <textarea
          value={outputText}
          readOnly
          placeholder="Processed text will appear here..."
          className="text-area bg-muted/10"
        />
      </div>

      {/* Stats */}
      <div className="px-4 py-2 border-t bg-muted/20 text-xs">
        {stats ? (
          <div className="flex items-center gap-4">
            <span className="stat">
              <span className="stat-value">{stats.wordsProcessed}</span> words processed
            </span>
            <span className="stat">
              <span className="stat-value">{stats.hyphensInserted}</span> hyphens inserted
            </span>
            <span className="stat">
              <span className="stat-value">{stats.processingTime}ms</span> processing time
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">No output yet</span>
        )}
      </div>
    </div>
  );
}
