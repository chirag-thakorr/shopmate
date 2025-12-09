

export function Stars({ value }) {
  if (value == null) return null;
  const rounded = Math.round(value * 2) / 2; // half-stars support if needed
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push('★');
    } else {
      stars.push('☆');
    }
  }
  return (
    <span style={{color:'#f5a623', fontSize:13, marginRight:4}}>
      {stars.join('')}
    </span>
  );
}