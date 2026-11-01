export const resolveColor = (cssVar: string) => {
  const temp = document.createElement("div");
  temp.style.color = `var(${cssVar})`;
  document.body.appendChild(temp);
  const color = getComputedStyle(temp).color;
  temp.remove();
  return color;
};
