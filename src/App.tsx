import { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  BookMarked,
  Check,
  Library,
} from 'lucide-react';

type ReadingStatus = 'want-to-read' | 'reading' | 'finished';

interface Book {
  id: string;
  title: string;
  status: ReadingStatus;
  addedAt: number;
}

const STATUS_META: Record<
  ReadingStatus,
  { label: string; color: string; ring: string; icon: typeof BookOpen }
> = {
  'want-to-read': {
    label: 'Want to Read',
    color: 'bg-amber-100 text-amber-800',
    ring: 'ring-amber-200',
    icon: BookMarked,
  },
  reading: {
    label: 'Reading',
    color: 'bg-sky-100 text-sky-800',
    ring: 'ring-sky-200',
    icon: BookOpen,
  },
  finished: {
    label: 'Finished',
    color: 'bg-emerald-100 text-emerald-800',
    ring: 'ring-emerald-200',
    icon: Check,
  },
};

const FILTERS: { value: 'all' | ReadingStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
];

const STORAGE_KEY = 'reading-list-books';
const MAX_TITLE_LENGTH = 60;

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(loadBooks);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<ReadingStatus>('want-to-read');
  const [filter, setFilter] = useState<'all' | ReadingStatus>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim().replace(/\s+/g, ' ');
    if (!trimmed) return;
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError('Book title must be 60 characters or fewer.');
      return;
    }
    const exists = books.some(
      (b) => b.title.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError('This book is already in your reading list.');
      return;
    }
    setError('');
    setBooks((prev) => [
      {
        id: crypto.randomUUID(),
        title: trimmed,
        status,
        addedAt: Date.now(),
      },
      ...prev,
    ]);
    setTitle('');
    setStatus('want-to-read');
  };

  const changeStatus = (id: string, newStatus: ReadingStatus) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const filtered =
    filter === 'all' ? books : books.filter((b) => b.status === filter);

  const counts = {
    all: books.length,
    'want-to-read': books.filter((b) => b.status === 'want-to-read').length,
    reading: books.filter((b) => b.status === 'reading').length,
    finished: books.filter((b) => b.status === 'finished').length,
  };

  const summary = [
    { label: 'Total Books', value: counts.all },
    { label: 'Currently Reading', value: counts.reading },
    { label: 'Finished', value: counts.finished },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-800 text-stone-50 shadow-sm">
            <Library className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Reading List
            </h1>
            <p className="text-sm text-stone-500">
              Track your books and reading progress
            </p>
          </div>
        </header>

        {/* Add Book Form */}
        <form
          onSubmit={addBook}
          className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="book-title"
                className="mb-1.5 block text-sm font-medium text-stone-600"
              >
                Book title
              </label>
              <input
                id="book-title"
                type="text"
                maxLength={MAX_TITLE_LENGTH}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter a book title..."
                className={`w-full rounded-xl border px-4 py-2.5 text-stone-800 placeholder-stone-400 outline-none transition focus:ring-2 focus:ring-stone-200 ${
                  error
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-stone-300 focus:border-stone-400'
                }`}
              />
              {error && (
                <p className="mt-1.5 text-sm text-red-500">{error}</p>
              )}
            </div>
            <div className="sm:w-40">
              <label
                htmlFor="book-status"
                className="mb-1.5 block text-sm font-medium text-stone-600"
              >
                Status
              </label>
              <select
                id="book-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-800 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
              >
                <option value="want-to-read">Want to Read</option>
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!title.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-800 px-5 py-2.5 font-medium text-stone-50 transition hover:bg-stone-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-5 w-5" />
              Add
            </button>
          </div>
        </form>

        {/* Summary */}
        {books.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            {summary.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-stone-800">
                  {s.value}
                </div>
                <div className="mt-0.5 text-xs font-medium text-stone-500 sm:text-sm">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {books.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              const count = counts[f.value];
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-stone-800 text-stone-50 shadow-sm'
                      : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      active
                        ? 'bg-stone-600 text-stone-50'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Book List */}
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/50 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <BookOpen className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium text-stone-600">
              Your reading list is empty. Add your first book.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/50 py-12 text-center">
            <p className="text-stone-500">
              No books in this category. Try a different filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((book) => {
              const meta = STATUS_META[book.status];
              const StatusIcon = meta.icon;
              return (
                <div
                  key={book.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.color} ${meta.ring}`}
                      >
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-semibold leading-snug text-stone-800 break-words">
                          {book.title}
                        </h3>
                        <span
                          className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteBook(book.id)}
                      aria-label="Delete book"
                      className="shrink-0 rounded-lg p-1.5 text-stone-300 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Status switcher */}
                  <div className="flex gap-1.5">
                    {(Object.keys(STATUS_META) as ReadingStatus[]).map(
                      (s) => {
                        const isActive = book.status === s;
                        return (
                          <button
                            key={s}
                            onClick={() => changeStatus(book.id, s)}
                            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                              isActive
                                ? `${STATUS_META[s].color} ring-1 ${STATUS_META[s].ring}`
                                : 'bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                            }`}
                          >
                            {STATUS_META[s].label}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-stone-400">
          Your reading list is saved on this device.
        </footer>
      </div>
    </div>
  );
}
