'use client';

const fileCls =
  'w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-white file:text-xs file:font-bold';

interface Props {
  label: string;
  accept: string;
  buttonCls: string;
  urlValue: string;
  placeholder: string;
  onFile: (file: File) => void;
  onUrl: (value: string) => void;
}

export function FileField({ label, accept, buttonCls, urlValue, placeholder, onFile, onUrl }: Props) {
  return (
    <div>
      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
        className={`${fileCls} ${buttonCls}`}
      />
      <input
        value={urlValue}
        onChange={(e) => onUrl(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-2 px-4 py-2 rounded-lg border border-neutral-200 text-xs font-mono focus:border-red-500 outline-none"
      />
    </div>
  );
}

export default FileField;