const fieldGroup = {
  marginBottom: 14,
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#4A5C4C',
  marginBottom: 5,
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--sand)',
  fontSize: 14,
  fontFamily: 'inherit',
  backgroundColor: '#FAFAF8',
  color: 'var(--bark)',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export function Input({ label, style, ...props }) {
  return (
    <div style={fieldGroup}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        style={{ ...inputStyle, ...style }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--sage)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--sand)')}
        {...props}
      />
    </div>
  );
}

export function Textarea({ label, style, ...props }) {
  return (
    <div style={fieldGroup}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        style={{ ...inputStyle, minHeight: 80, resize: 'vertical', ...style }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--sage)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--sand)')}
        {...props}
      />
    </div>
  );
}

export function Select({ label, options, placeholder = 'Select...', ...props }) {
  return (
    <div style={fieldGroup}>
      {label && <label style={labelStyle}>{label}</label>}
      <select style={inputStyle} {...props}>
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const val = typeof o === 'string' ? o : o.value;
          const lbl = typeof o === 'string' ? o : o.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}
