import { Link, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import React from 'react';
import { Editor } from '@tiptap/react';

export const LinkButton = ({ editor }: { editor: Editor | null }) => {
  const [url, setUrl] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  if (!editor) return null;

  const setLink = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    
    if (!url) {
      // Remove link if URL is empty
      editor.chain().focus().extendMarkRange('link').unsetMark('link').run();
      return;
    }

    // Insert or update the link
    if (text) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: text,
          marks: [{ type: 'link', attrs: { href: url } }],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setMark('link', { href: url })
        .run();
    }

    setIsOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetMark('link').run();
    setUrl('');
    setIsOpen(false);
  };

  const isActive = editor.isActive('link');
  const currentUrl = editor.getAttributes('link').href || '';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            setIsOpen(!isOpen);
            if (isActive) {
              setUrl(currentUrl);
            } else {
              setUrl('');
            }
          }}
        >
          <Link className="size-4" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 space-y-2">
        <Input
          placeholder="Enter URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setLink();
            }
          }}
          autoFocus
        />
        
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(url || currentUrl, '_blank')}
              disabled={!url && !currentUrl}
            >
              <ExternalLink className="size-4" />
            </Button>
            
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeLink}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={setLink}
            disabled={!url && !isActive}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};