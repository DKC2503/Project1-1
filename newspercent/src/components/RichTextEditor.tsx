import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Node } from '@tiptap/core';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Image as ImageIcon, 
  Heading1,
  Heading2,
  Undo,
  Redo,
  Globe
} from 'lucide-react';
import api from '../config/api';

// Custom Tiptap Node for rendering external resource cards
const ExternalResourceCard = Node.create({
  name: 'externalResourceCard',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      url: { default: '' },
      title: { default: '' },
      description: { default: '' },
      label: { default: 'Official Website' }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div.external-resource-card',
        getAttrs: (node: any) => ({
          url: node.getAttribute('data-url') || '',
          title: node.getAttribute('data-title') || '',
          description: node.getAttribute('data-description') || '',
          label: node.getAttribute('data-label') || 'Official Website'
        })
      }
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const { url, title, description, label } = HTMLAttributes;
    let domain = '';
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
    
    return [
      'div',
      {
        class: 'external-resource-card',
        'data-url': url,
        'data-title': title,
        'data-description': description,
        'data-label': label
      },
      [
        'div',
        { class: 'external-card-header' },
        [
          'span',
          { class: 'external-card-icon' },
          [
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2.5',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              class: 'w-4 h-4'
            },
            [
              'circle',
              { cx: '12', cy: '12', r: '10' }
            ],
            [
              'line',
              { x1: '2', y1: '12', x2: '22', y2: '12' }
            ],
            [
              'path',
              { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }
            ]
          ]
        ],
        ['span', { class: 'external-card-label' }, label]
      ],
      [
        'div',
        { class: 'external-card-body' },
        ['h4', { class: 'external-card-title' }, title],
        description ? ['p', { class: 'external-card-description' }, description] : ['span', { class: 'hidden' }],
        ['span', { class: 'external-card-domain' }, domain]
      ],
      [
        'div',
        { class: 'external-card-footer' },
        [
          'a',
          {
            href: url,
            target: '_blank',
            rel: 'noopener noreferrer',
            class: 'external-card-cta'
          },
          'Visit Website ',
          ['span', { class: 'external-card-arrow' }, '↗']
        ]
      ]
    ];
  }
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  // Modal & card creation states
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardUrl, setCardUrl] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardDesc, setCardDesc] = useState('');
  const [cardLabel, setCardLabel] = useState('Official Website');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Decrypting intelligence body...',
      }),
      ExternalResourceCard,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await api.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (res.data.success) {
            editor?.chain().focus().setImage({ src: res.data.imageUrl }).run();
          }
        } catch (err) {
          console.error('Editor Image Upload Failed:', err);
        }
      }
    };
    input.click();
  }, [editor]);

  const insertResourceCard = () => {
    if (!cardUrl.trim() || !cardTitle.trim()) {
      alert('URL and Card Title are required.');
      return;
    }

    editor?.chain().focus().insertContent({
      type: 'externalResourceCard',
      attrs: {
        url: cardUrl.trim(),
        title: cardTitle.trim(),
        description: cardDesc.trim(),
        label: cardLabel,
      },
    }).run();

    // Reset state & close
    setCardUrl('');
    setCardTitle('');
    setCardDesc('');
    setCardLabel('Official Website');
    setIsCardModalOpen(false);
  };

  if (!editor) return null;

  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-[var(--input-border)] rounded-2xl overflow-hidden bg-[var(--input-bg)] focus-within:border-primary/40 transition-all relative">
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-[var(--input-border)] bg-[var(--surface-hover)]">
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
          <Italic className="w-4 h-4" />
        </MenuButton>
        <div className="w-px h-6 bg-[var(--glass-border)] mx-2" />
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="H1">
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2">
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <div className="w-px h-6 bg-[var(--glass-border)] mx-2" />
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="List">
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <div className="w-px h-6 bg-[var(--glass-border)] mx-2" />
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
          <Quote className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={addImage} title="Insert Visual">
          <ImageIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => setIsCardModalOpen(true)} title="Insert External Resource Card">
          <Globe className="w-4 h-4" />
        </MenuButton>
        <div className="flex-1" />
        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </MenuButton>
      </div>
      <EditorContent editor={editor} className="p-8 min-h-[400px] prose prose-invert dark:prose-invert prose-red max-w-none focus:outline-none text-[var(--input-text)]" />

      {/* Insert External Resource Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsCardModalOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          {/* Modal Box */}
          <div className="relative w-full max-w-md liquid-glass p-6 sm:p-8 rounded-[2rem] bg-[var(--background-deep)] border border-[var(--glass-border)] shadow-2xl z-10 text-left font-manrope">
            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-wider mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Insert Link Card
            </h3>
            
            <div className="space-y-4">
              {/* URL Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Resource URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/resource"
                  value={cardUrl}
                  onChange={(e) => setCardUrl(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-primary font-mono"
                />
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Card Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Project Documentation or Official API Reference"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Description Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Short Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Provide a brief context or summary of the linked resource..."
                  value={cardDesc}
                  onChange={(e) => setCardDesc(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Label Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Badge Label</label>
                <select
                  value={cardLabel}
                  onChange={(e) => setCardLabel(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-3 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Official Website">Official Website</option>
                  <option value="Official Resource">Official Resource</option>
                  <option value="Download Portal">Download Portal</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Source Code">Source Code</option>
                  <option value="Dataset">Dataset</option>
                  <option value="Whitepaper">Whitepaper</option>
                  <option value="Reference Link">Reference Link</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="px-5 py-3 border border-[var(--glass-border)] rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertResourceCard}
                className="px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-red-600 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                Insert Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
