# expo-coding-with-ai 👋

This is an [Expo](https://expo.dev) project bootstrapped with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). It uses [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing with TypeScript.

## Get started

1.  **Install dependencies**

    ```bash
    pnpm install
    ```

2.  **Start the app**

    ```bash
    # Start the development server
    pnpm start 
    # Or use the alias
    pnpm dev 
    ```

    In the output, you'll find options to open the app in a:

    *   [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
    *   [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
    *   [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
    *   [Expo Go](https://expo.dev/go) (limited sandbox)

    You can start developing by editing the files inside the `app/` directory.

## Available Scripts

In the project directory, you can run:

*   `pnpm start` or `pnpm dev`: Runs the app in development mode with the Metro bundler.
*   `pnpm android`: Opens the app on a connected Android device or emulator.
*   `pnpm ios`: Opens the app on an iOS simulator (macOS only).
*   `pnpm web`: Opens the app in a web browser.
*   `pnpm lint`: Lints the project files using Expo's lint configuration.
*   `pnpm test`: Runs the test suite using Jest.

*Note: The `get-ui` script still exist but is omitted here for brevity.*

## Generate a folder with only relevant UI code

This script helps isolate the UI-related code and configuration into a separate directory for easier sharing or review.

```bash
pnpm get-ui
```

Running this command will:

1.  Create a new directory named `ui-only/rosebud-mobile-ui-only/` (removing any existing one).
2.  Copy UI-related directories (`app`, `assets`, `components`, `constants`, `hooks`) into it.
3.  Copy essential configuration files (`package.json`, `app.json`, `tsconfig.json`) into it.
4.  Generate a basic `README.md` and `.env` file within the new directory.

This creates a self-contained snapshot of the application's UI layer.
