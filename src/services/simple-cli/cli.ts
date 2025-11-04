type CommandInfo = {
  name: string;
  description?: string;
  usage?: string;
};

type FlagInfo = {
  name: string;
  description: string;
};

const commands: CommandInfo[] = [];
const registeredFlags: FlagInfo[] = [];
const args = process.argv.slice(2);

// Parse all flags (arguments starting with --)
const flags: string[] = [];
const nonFlagArgs: string[] = [];

// Extract all flags from anywhere in the args
for (const arg of args) {
  if (arg.startsWith("--")) {
    flags.push(arg);
  } else {
    nonFlagArgs.push(arg);
  }
}

const commandName = nonFlagArgs[0];
const commandArgs = nonFlagArgs.slice(1);

let helpCalled = false;
let commandMatched = false;
let autoHelpTimeout: NodeJS.Timeout;

export function command(name: string): boolean;
export function command(name: string, description: string): boolean;
export function command(
  name: string,
  description: string,
  usage: string,
): boolean;
export function command(
  name: string,
  description?: string,
  usage?: string,
): boolean {
  // Register command for help
  if (description || usage) {
    commands.push({ name, description, usage });
  }

  // Set up auto-help on first command() call
  if (
    !autoHelpTimeout &&
    (!commandName || flags.includes("--help") || flags.includes("-h"))
  ) {
    autoHelpTimeout = setTimeout(() => {
      if (!helpCalled) {
        help();
      }
    }, 0);
  }

  // Set up check for unmatched commands
  if (!autoHelpTimeout && commandName) {
    autoHelpTimeout = setTimeout(() => {
      if (!helpCalled && !commandMatched) {
        console.error(`Error: Unknown command "${commandName}"\n`);
        displayHelp();
        process.exit(1);
      }
    }, 0);
  }

  const matches = commandName === name;
  if (matches) {
    commandMatched = true;
  }
  return matches;
}

export function firstArgument(): string {
  return commandArgs[0] || "";
}

export function secondArgument(): string {
  return commandArgs[1] || "";
}

export function thirdArgument(): string {
  return commandArgs[2] || "";
}

export function allArguments(): string[] {
  return commandArgs;
}

export function flag(name: string): boolean;
export function flag(name: string, description: string): boolean;
export function flag(name: string, description?: string): boolean {
  // Register flag for help if description provided
  if (description) {
    const existing = registeredFlags.find((f) => f.name === name);
    if (!existing) {
      registeredFlags.push({ name, description });
    }
  }

  return flags.includes(`--${name}`);
}

function displayHelp(): void {
  console.log("Usage: <command> [args] [options]\n");
  console.log("Commands:");

  const maxNameLength = Math.max(...commands.map((cmd) => cmd.name.length));

  for (const cmd of commands) {
    const padding = " ".repeat(maxNameLength - cmd.name.length + 2);
    const description = cmd.description || "";
    const usage = cmd.usage ? ` ${cmd.usage}` : "";
    console.log(`  ${cmd.name}${usage}${padding}${description}`);
  }

  if (registeredFlags.length > 0) {
    console.log("\nOptions:");
    const maxFlagLength = Math.max(
      ...registeredFlags.map((flag) => flag.name.length),
    );

    for (const flag of registeredFlags) {
      const padding = " ".repeat(maxFlagLength - flag.name.length + 2);
      console.log(`  --${flag.name}${padding}${flag.description}`);
    }
  }

  console.log('\nUse "--help" to see this message');
}

function help(): void {
  helpCalled = true;
  if (autoHelpTimeout) {
    clearTimeout(autoHelpTimeout);
  }

  if (!commandName || flags.includes("--help") || flags.includes("-h")) {
    displayHelp();
    process.exit(0);
  }
}
