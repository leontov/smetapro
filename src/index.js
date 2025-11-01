export function greet(name) {
  if (!name) {
    throw new Error("Name is required to generate a greeting.");
  }

  return `Hello, ${name}!`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , name] = process.argv;
  const person = name ?? "world";
  console.log(greet(person));
}
