export const generateWelcomeEmailTemplate = (name?: string) => `
    <h1>Welcome ${name ? name : ""}</h1>
`;
