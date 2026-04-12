export default function Badge({ text, color = 'var(--sage)', style }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: color + '22',
        color,
        display: 'inline-block',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {text}
    </span>
  );
}
