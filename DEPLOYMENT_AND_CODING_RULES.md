# Deployment and Coding Rules

This document outlines essential rules and guidelines for development and deployment to ensure smooth and error-free releases.

## I. Git and Deployment Workflow

1.  **Commit and Push Regularly:** Before expecting any changes to appear in a Vercel (or any CI/CD) deployment, ensure all local code modifications are:
    *   Committed to your local Git repository.
    *   Pushed to the correct branch on the remote repository (e.g., `master`, `main`, or your feature branch) that Vercel is configured to deploy from.
2.  **Verify Deployment Commit:** Always check the Vercel deployment logs to confirm which commit hash is being built. This helps diagnose if the latest code is actually being deployed.
3.  **Iterative Debugging:** When Vercel builds fail, review the logs carefully. Fix errors one at a time, commit, push, and redeploy. This makes it easier to pinpoint the cause of failures.

## II. ESLint Guidelines

1.  **Strive for Zero ESLint Issues:** Treat ESLint errors and warnings seriously. They often point to potential bugs, stylistic inconsistencies, or deviations from best practices.
2.  **Handling Unused Variables/Parameters:**
    *   If a variable or function parameter is genuinely unused, remove it.
    *   If a function parameter must be present due to a required signature (e.g., in Next.js API routes like `_request: NextRequest`, or component props) but is intentionally not used in the function body, prefix it with an underscore (e.g., `_request`, `_unusedProp`).
    *   **Configuration for Underscore Prefixes:** To prevent ESLint from flagging these intentionally unused underscore-prefixed variables, configure your project's ESLint settings. In `.eslintrc.json` (or your ESLint config file), for the `@typescript-eslint/no-unused-vars` rule, add:
        ```json
        {
          "rules": {
            "@typescript-eslint/no-unused-vars": [
              "warn", // or "error"
              {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
              }
            ]
          }
        }
        ```
    *   **Inline Disabling (Use Sparingly):** If project-wide configuration is not immediately feasible, you can use `// eslint-disable-next-line @typescript-eslint/no-unused-vars` on the line preceding the declaration as a temporary measure.
3.  **`no-explicit-any`:** Avoid using the `any` type in TypeScript. Strive to provide specific types for all variables, function parameters, and return values. This improves code safety and maintainability.
4.  **Skipping ESLint on Build (Temporary Measure):**
    *   For Next.js projects, if ESLint errors are blocking a critical deployment and cannot be fixed immediately, you can configure `next.config.js` to ignore ESLint during the build process:
        ```javascript
        /** @type {import('next').NextConfig} */
        const nextConfig = {
          eslint: {
            ignoreDuringBuilds: true,
          },
        };
        module.exports = nextConfig;
        ```
    *   **Warning:** This should be a temporary workaround. Plan to address the underlying ESLint issues.

## III. TypeScript Best Practices

1.  **Type Safety is Paramount:** TypeScript errors are not mere suggestions; they indicate potential runtime issues or incorrect code structure. These errors **must** be resolved as they will halt the Next.js build process.
2.  **Strong Typing:** Always prefer specific types over `any`. Utilize interfaces, types, and generics to model your data and functions accurately.
3.  **Compiler Options:** Familiarize yourself with and utilize strict TypeScript compiler options in your `tsconfig.json` (e.g., `strict: true`, `noImplicitAny: true`) to catch more errors at compile time.

## IV. Supabase (and Similar Async Library) Client Usage

1.  **Asynchronous Operations:** All calls to the Supabase client (or similar asynchronous libraries) that perform I/O (e.g., database queries, RPC calls) are asynchronous and return Promises (or promise-like objects).
2.  **`await` and Error Object Destructuring:**
    *   Always use `await` when calling these asynchronous functions.
    *   Supabase client methods typically return an object containing `data` and `error` properties (e.g., `{ data, error }`).
    *   **Correct error handling pattern:**
        ```typescript
        async function fetchData() {
          const { data, error } = await supabase
            .from('your_table')
            .select('*')
            .eq('id', 'some-id')
            .single();

          if (error) {
            console.error('Supabase query failed:', error.message);
            // Handle the error appropriately (e.g., return an error response)
            return;
          }

          // Process the 'data' if no error occurred
          console.log(data);
        }
        ```
3.  **Avoid Incorrect `.catch()` Chaining:** Do **not** chain `.catch()` directly to Supabase query builder method sequences as if they were standard JavaScript Promises for error handling. This pattern is incorrect for the Supabase client library and will lead to TypeScript errors like `Property 'catch' does not exist on type...`. The `error` object returned after `await` is the correct way to check for errors from the operation.

By adhering to these rules, the development team can maintain a higher code quality, reduce deployment issues, and ensure a more stable application. 