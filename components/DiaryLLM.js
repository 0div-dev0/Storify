'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  invalidateJournalCache,
  getCachedJournal,
  setCachedJournal
} from '@/lib/journalCache'
import PreviousJournals from './PreviousJournals'
import { useData } from '@/lib/DataContext'

export default function DiaryLLM() {
  const { data: session } = useSession()
  const { setOptimisticJournal } = useData()
  const [title, setTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date()
    return now.toISOString().split('T')[0]
  })
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'saved' | 'error' | null
  const [editingId, setEditingId] = useState(null) // if editing an existing journal
  const [refreshKey, setRefreshKey] = useState(0) // to trigger PreviousJournals reload
  const [editorReady, setEditorReady] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your journal entry…',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
    },
    onCreate: () => setEditorReady(true),
    immediatelyRender: false,
  })

  // Reset editor for a new entry
  const resetEditor = useCallback(() => {
    if (!editor) return
    editor.commands.clearContent()
    setTitle('')
    setEditingId(null)
    setSaveStatus(null)
    setSelectedDate(new Date().toISOString().split('T')[0])
  }, [editor])

  // Load an existing journal into the editor
  const handleEdit = useCallback(async (journal) => {
    if (!editor) return

    // Try cache first
    let fullJournal = getCachedJournal(journal._id)

    if (!fullJournal) {
      try {
        const res = await fetch(`/api/journals/${journal._id}`)
        const data = await res.json()
        if (res.ok) {
          fullJournal = data.journal
          setCachedJournal(journal._id, fullJournal)
        }
      } catch (err) {
        console.error('Failed to load journal:', err)
        return
      }
    }

    if (fullJournal) {
      editor.commands.setContent(fullJournal.content)
      setTitle(fullJournal.title || '')
      setEditingId(fullJournal._id)
      setSelectedDate(new Date(fullJournal.date).toISOString().split('T')[0])
      setSaveStatus(null)

      // Scroll to top of editor
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [editor])

  // Save / Update
  const handleSave = async () => {
    if (!editor || !session?.user?.id) return

    const content = editor.getHTML()
    const plainText = editor.getText()

    if (!plainText.trim()) {
      setSaveStatus('empty')
      return
    }

    setSaving(true)
    setSaveStatus(null)

    setOptimisticJournal({
      _id: editingId || 'temp-' + Date.now(),
      title: title || 'Untitled Entry',
      plainText: plainText,
      date: selectedDate,
      isOptimistic: true
    })

    try {
      const url = editingId ? `/api/journals/${editingId}` : '/api/journals'
      const method = editingId ? 'PUT' : 'POST'

      const body = editingId
        ? { title: title || 'Untitled Entry', content, plainText }
        : { title: title || 'Untitled Entry', content, plainText, date: selectedDate }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        setSaveStatus('saved')
        invalidateJournalCache(session.user.id, editingId)
        if (data.journal) {
          setCachedJournal(data.journal._id, data.journal)
          setEditingId(data.journal._id)
        }
        setRefreshKey((k) => k + 1)

        // Automatic goal analysis — fires in background after save
        fetch('/api/goals/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: selectedDate }),
        }).then(() => {
          setOptimisticJournal(null)
          // Notify DataContext to force-refresh all caches
          window.dispatchEvent(new CustomEvent('journalSaved'));
        }).catch(err => {
          console.error('Auto analysis failed:', err)
          setOptimisticJournal(null)
        });

      } else {
        setSaveStatus(data.error || 'error')
        setOptimisticJournal(null)
      }
    } catch (err) {
      console.error('Save error:', err)
      setSaveStatus('error')
      setOptimisticJournal(null)
    } finally {
      setSaving(false)
    }
  }

  if (!editorReady || !editor) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-0 h-full overflow-hidden">
      {/* ===== EDITOR PANEL ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-white/5 bg-gray-950/80">
          <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
            <label htmlFor="journal-title" className="sr-only">
              Journal entry title
            </label>
            <input
              id="journal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Entry"
              className="flex-1 bg-transparent text-xl font-semibold text-white placeholder:text-slate-400 focus:outline-none truncate"
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!editingId && (
              <div>
                <label htmlFor="journal-date" className="sr-only">
                  Journal entry date
                </label>
                <input
                  id="journal-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-800/60 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/50 [color-scheme:dark]"
                />
              </div>
            )}
            {editingId && (
              <span className="text-sm text-slate-400 italic">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <EditorToolbar editor={editor} />

        {/* Editor area */}
        <div className="h-[50%] overflow-y-auto h-30 px-5 py-4 rounded-lg border-2 border-gray-800 bg-black m-5">
          <EditorContent editor={editor} className="h-full" rows={10} />
        </div>

        {/* Bottom bar: Save */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/5 bg-gray-950/80">
          <div className="flex items-center gap-2 min-w-0">
            {saveStatus === 'saved' && (
              <span className="text-emerald-400 text-sm flex items-center gap-1.5 animate-fade-in">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Saved successfully
              </span>
            )}
            {saveStatus === 'empty' && (
              <span className="text-amber-300 text-sm">Write something before saving.</span>
            )}
            {saveStatus && saveStatus !== 'saved' && saveStatus !== 'empty' && saveStatus !== 'error' && (
              <span className="text-rose-300 text-sm">{saveStatus}</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-rose-300 text-sm">Failed to save. Try again.</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editingId && (
              <button
                onClick={resetEditor}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all border border-slate-700/50"
              >
                + New Entry
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : editingId ? (
                'Update Entry'
              ) : (
                'Save Entry'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===== PREVIOUS JOURNALS PANEL ===== */}
      <PreviousJournals
        key={refreshKey}
        onEdit={handleEdit}
        onDelete={() => setRefreshKey((k) => k + 1)}
        activeId={editingId}
      />
    </div>
  )
}

// ===== TOOLBAR COMPONENT =====
function EditorToolbar({ editor }) {
  if (!editor) return null

  const btnClass = (active) =>
    `p-2 rounded-lg text-sm transition-all ${active
      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
    }`

  const divider = <div className="w-px h-5 bg-white/20 mx-0.5" />

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-gray-900/50 flex-wrap">
      {/* Text style */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        aria-label="Bold"
        title="Bold (Ctrl+B)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        aria-label="Italic"
        title="Italic (Ctrl+I)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
        aria-label="Underline"
        title="Underline (Ctrl+U)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#fbbf24' }).run()}
        className={btnClass(editor.isActive('highlight'))}
        aria-label="Highlight"
        title="Highlight"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96c.39-.39.39-1.02 0-1.41L18.37.29a.996.996 0 00-1.41 0L15 2.25 18.75 6l1.96-1.96z" />
          <path d="M2 20h20v4H2z" fill="currentColor" fillOpacity="0.3" />
        </svg>
      </button>

      {divider}

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive('heading', { level: 1 }))}
        aria-label="Heading 1"
        title="Heading 1"
      >
        <span className="font-bold text-xs">H1</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        aria-label="Heading 2"
        title="Heading 2"
      >
        <span className="font-bold text-xs">H2</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive('heading', { level: 3 }))}
        aria-label="Heading 3"
        title="Heading 3"
      >
        <span className="font-bold text-xs">H3</span>
      </button>

      {divider}

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        aria-label="Bullet list"
        title="Bullet List"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        aria-label="Numbered list"
        title="Numbered List"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        aria-label="Blockquote"
        title="Blockquote"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btnClass(editor.isActive('codeBlock'))}
        aria-label="Code block"
        title="Code Block"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
        </svg>
      </button>

      {divider}

      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={btnClass(editor.isActive({ textAlign: 'left' }))}
        aria-label="Align left"
        title="Align Left"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={btnClass(editor.isActive({ textAlign: 'center' }))}
        aria-label="Align center"
        title="Align Center"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={btnClass(editor.isActive({ textAlign: 'right' }))}
        aria-label="Align right"
        title="Align Right"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
        </svg>
      </button>

      {divider}

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${btnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${btnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="Redo"
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
        </svg>
      </button>

      {divider}

      {/* Horizontal Rule */}
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={btnClass(false)}
        aria-label="Horizontal rule"
        title="Horizontal Rule"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 11h18v2H3z" />
        </svg>
      </button>
    </div>
  )
}